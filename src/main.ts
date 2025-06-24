import * as core from '@actions/core'
import { downloadZstd } from './download-release'
import * as path from 'path'
import * as fs from 'fs'
import { rimraf } from 'rimraf'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    console.log('env', process.env)
  // tar.c({strip:1}, ['eic']).pipe(fs.createWriteStream('xxx.tar'));

    const zstdTag: string = core.getInput('zstdTag')
    const zstdFileName: string = core.getInput('zstdFileName')
    console.log(zstdTag)
    console.log(zstdFileName)

    await downloadZstd({ tag: zstdTag, fileName: zstdFileName })
    console.log(process.cwd())
    let zstdDir = path.join(process.cwd(), '../zstd')
    console.log(zstdDir);
    // todo execa执行zstd
    let result = fs.readdirSync(zstdDir)
    console.log(result)
    const cleanCwd = core.getInput('cleanCwd', { required: false })
    if (cleanCwd) {
      const cleanPaths = core.getInput('cleanPaths', { required: false })
      console.log('清理', cleanPaths)

      // rimraf([],{glob:{cwd:cleanCwd}})
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
