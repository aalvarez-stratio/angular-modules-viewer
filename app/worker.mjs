import TypescriptParser from "./typescript-parser/typescript-parser.js";
import {parentPort} from "worker_threads";


parentPort.on('message', (event) => {
  console.log('event')
  console.log(String(TypescriptParser))
  console.log('event2')
  new TypescriptParser().readFiles(event.data)
    .then((results) => {
      parentPort.postMessage(results.getResult());
    });
});
