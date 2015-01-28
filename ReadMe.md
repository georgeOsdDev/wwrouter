# WWRouter

WWRouter provides (HTTP(s)|ws(s)) clients which was routed to a server-side endpoint.
All clients work on background as [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/basic_usage).


## Example
```javascript

// HTTPRequest worker
// get/post/put/delete is available
var msgs = WWRouter.route("/msgs");
    msgs.get({limit:10})
        .then(function(result){
          console.log(result.status, result.body)
        })
        .catch(function(){
          console.log(result.status, result.body)
        })

    msgs.post({"msg":"Hello"})
        .then(function(result){
          console.log(result.status, result.body)
        })
        .catch(function(){
          console.log(result.status, result.body)
        })

//routing with path param
var msg1 = WWRouter.route("/msgs/:id", {id:1})
    msg1.delete({})
        .then(function(result){
          console.log(result.status, result.body)
        })
        .catch(function(){
          console.log(result.status, result.body)
        })



// WebSocket worker
var roomA = WWRouter.route("ws://"+location.host+"/rooms/:roomId", {roomId: "A"});
    roomA.on("message", function(msg){
        console.log(msg);
    });

    roomA.open()
    .then(function(response){
        console.log(response);

        roomA.send({"Hello":"World"});
    })
    .catch(function(response){
        console.log(response);
    });
```


## How to Development

Install Node.js and NPM.

```bash
git clone git://github.com/georegeosddev/wwrouter.git
cd wwrouter
npm install
npm run-script build
```

## How to test

Install JDK for mock server.

```bash
gulp browserify
gulp copy
cd test/mock-server
sbt/sbt run # This command run Xitrum server as mock backend
```
And then open http://localhost:8000

*TODO*
Automate

## How to setup Travis.ci

## How to setup Sauce Labs.

## How to publish to NPM

## How to publish to bower

## Licence
MIT
