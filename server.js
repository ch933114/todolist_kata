const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandler = require('./errorHandler');
const todos = [];

const requestListener = (req,res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    let body= "";
    req.on('data',chunk=>{
        body+=chunk;
    })

    if(req.url=="/todos" && req.method == "GET") {
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    } else if (req.url=="/todos" && req.method == "POST" ) {
        req.on('end',()=>{
            try{
                const title= JSON.parse(body).title;
                if (title !== undefined){
                    const todo = {
                        "title": title,
                        "id": uuidv4(),
                    }
                    todos.push(todo);
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                      "status":"success",
                      "data": todos
                    }));
                    res.end();
                } else {
                    errorHandler(res);
                }
            } catch (error) {
                errorHandler(res);
            }
        })
    } else if (req.url=="/todos" && req.method == "DELETE" ) {
        todos.length = 0;
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
            "delete":"yes"
        }));
        res.end();
    } else if (req.url.startsWith("/todos/") && req.method=="DELETE") {
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element => element.id == id);
        if (index!==-1){
            todos.splice(index,1);
            res.writeHead(200,headers);
            res.write(JSON.stringify({
              "status": "success",
              "data": todos,
            }));
            res.end();
        } else {
            errorHandler(res);
        }
    } else if (req.url.startsWith("/todos/") && req.method=="PATCH") {
        req.on('end',()=>{
            try {
                const todo = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element => element.id == id);
                if (todo !== undefined && index!==-1) {
                    todos[index].title = todo;
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                } else {
                    errorHandler(res);
                }
            } catch {
                errorHandler(res);
            }
        })
    } else if (req.method == "OPTIONS") {
        res.writeHead(200,headers);
        res.end();
    }
    else {
        res.writeHead(404,headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);