/**
 * Your HTTP handling function, invoked with each request. This is an example
 * function that echoes its input to the caller, and returns an error if
 * the incoming request is something other than an HTTP POST or GET.
 *
 * @param {Context} context a context object.
 * @param {object} context.body the request body if any
 * @param {object} context.query the query string deserialzed as an object, if any
 * @param {object} context.log logging object with methods for 'info', 'warn', 'error', etc.
 * @param {object} context.headers the HTTP request headers
 * @param {string} context.method the HTTP request method
 * @param {string} context.httpVersion the HTTP protocol version
 * See: https://github.com/knative-sandbox/kn-plugin-func/blob/main/docs/guides/nodejs.md#the-context-object
 */

 require('dotenv').config()
 let fs = require('fs');
 var AdmZip = require("adm-zip");
 const Ajv = require("ajv");
 const cosschema = fs.readFileSync('./ibm-cos-event-schema.json');
 //console.log(cosschema.toString())
 const ajv = new Ajv();
 const validate = ajv.compile(JSON.parse(cosschema.toString()));

 let accessKeyId = process.env.S3_ACCESS_KEY;
 let secretAccessKey = process.env.S3_SECRET;
 let endpoint = process.env.S3_ENDPOINT;
 let ghToken = process.env.GIT_TOKEN;
 
 const { Octokit } = require("@octokit/rest");
 const { createPullRequest } = require("octokit-plugin-create-pull-request");

 const MyOctokit = Octokit.plugin(createPullRequest);

 const TOKEN = ghToken; // create token at https://github.com/settings/tokens/new?scopes=repo
 const octokit = new MyOctokit({
  auth: TOKEN,
 });

  function logError(e) {
    console.log(`ERROR: ${e.code} - ${e.message}\n`);
  }

  function logDone() {
    console.log('DONE!\n');
  }
 var AWS = require('aws-sdk');
 AWS.config.update(
     {
         accessKeyId: accessKeyId,
         secretAccessKey: secretAccessKey,
        //  s3ForcePathStyle: true,
        //  region : "",
         endpoint: endpoint
     }
 );

function handle(context) {
  console.log(JSON.stringify(context.body, null, 2))
  
  // If the request is an HTTP POST, the context will contain the request body
  if (context.method === 'POST') {
    const valid = validate(context.body);
    if (!valid) { 
      console.log(validate.errors);
      return { "invaliddocument" : validate.errors };
    }

    let bucket = context.body.bucket;
    let filename = context.body.key;
    var s3 = new AWS.S3();
    writeFile = fs.createWriteStream(filename);
    
    let filestream = s3.getObject(
        { Bucket: bucket, Key: filename }).createReadStream();

    filestream.pipe(writeFile);

    filestream.on('error', (err) => {
      console.log('Error in file stream...' + err);
    });

    writeFile.on('error', (err) => {
      console.log('Error in write stream...' + err);
    });

    filestream.on('end', function() {
      let prconfig = {};
      console.log("starting unzip")
      var zip = new AdmZip(`./${filename}`);
      zip.extractAllTo("./", true);
      console.log("finished unzip")
      let stub = filename.split('.')[0];
      prconfig.stub = stub;
      fs.readFile(`./${stub}-pod-info.json`, 'utf8' , (err, poddata) => {
        console.log(`starting ./${stub}-pod-info.json`)
        if (err) {
          console.log(err)
          return {}
        }
        let pod_info = JSON.parse(poddata);
        console.log("parsed pod info");
        //let repo = ps_info.info.config.labels["info.coredumps.repo"]
        console.log(pod_info)
        prconfig.repo = pod_info.labels["code_repo"];
        prconfig.owner = pod_info.labels["codeowner"];
        prconfig.zipfile = filename;
        console.log("finished prconfig for pod");
        
        fs.readFile(`./${stub}-dump-info.json`, 'utf8' , (err, dumpdata) => {
          console.log(`starting ./${stub}-dump-info.json`)
          if (err) {
            console.error(err)
            return {}
          }
          let dump_info = JSON.parse(dumpdata);
          console.log("parsed dump info");
          prconfig.path = dump_info.path.split('!').join('/');
          prconfig.new_path = `/debug/${dump_info.exe}`;
          prconfig.id = dump_info.uuid
          // there can be more than one image file but we are hardcoding 0 in.
          // probably needs to be done with a label?
          fs.readFile(`./${stub}-0-image-info.json`, 'utf8' , (err, imagedata) => {
            if (err) {
              console.error(err)
              return {}
            }
            let image_info = JSON.parse(imagedata);
            // This is probably ok as any of the tags should point to the same image
            prconfig.image = image_info.repoTags[0];
            // need some logic to select the right image.
            prconfig.debugger = "quay.io/icdh/default@sha256:5d790e699613caeb9903e6b85654a041d0343db4f24ef4d61d5d5920d261e4ad";
            console.log(prconfig)

            octokit.createPullRequest({
            owner: prconfig.owner,
            repo: prconfig.repo,
            title: `Core Dump Generated - ${prconfig.id}`,
            body: "A core dump has been generated. Please see comments below on how to access it",
            base: "main" /* optional: defaults to default branch */,
            head: `core-dump-${prconfig.id}`,
            changes: [
                {
                    /* optional: if `files` is not passed, an empty commit is created instead */
                    files: {
                        ".gitpod.yml":
                            `tasks:
  - init: /debug/init.sh
image:
  file: .gitpod.Dockerfile`,
                        ".gitpod.Dockerfile": `FROM ${prconfig.image} as crasher
                    FROM ${prconfig.debugger}
                    # We can get the exe location from the dump file - "path" property
                    COPY --from=crasher ${prconfig.path} ./
                    # We can get the file name from the dump event
                    ENV CORE_FILE=${prconfig.zipfile}
                    # We can get the exe location from the dump file "exe" property
                    ENV EXE_LOCATION=${prconfig.new_path}
                    # This will have to be constructed from the dump_file name
                    ENV CORE_LOCATION=${prconfig.stub}/${prconfig.stub}.core
                    `,
                    },
                    commit:
                        "creating .gitpod.yaml .gitpod.Dockerfile",
                },
            ],
        })
        .then((pr) => {
            console.log(pr.data.number);
            
            // octokit.rest.issues.createComment({
            //     owner: prconfig.owner,
            //     repo: prconfig.repo,
            //     issue_number: pr.data.number,
            //     body: `<a href="https://gitpod.io/#https://github.com/${prconfig.owner}/${prconfig.repo}/pull/${pr.data.number}">You can start investigating this on gitpod right now</a>`,
            
            //   });
              return {
                body: context.body,
              }
            });
          });
        });
      });
    });

    // sha256:5d790e699613caeb9903e6b85654a041d0343db4f24ef4d61d5d5920d261e4ad
  // If the request is an HTTP GET, the context will include a query string, if it exists
  } else if (context.method === 'GET') {
    return {
      query: context.query,
    }
  } else {
    return { statusCode: 405, statusMessage: 'Method not allowed' };
  }
}

// Export the function
module.exports = { handle };

function getPrConfig(stub) {

}