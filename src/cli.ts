import * as commander from "commander";
import {translate} from "./main";


const program = new commander.Command()

program.version('0.0.1')
    .name('node-translate')
    .usage('<words>')
    .arguments('<words>')
    .action((words)=>{
        translate(words)
    })

program.parse(process.argv)
