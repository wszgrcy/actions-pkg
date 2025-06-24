import * as core from '@actions/core'
// import { downloadZstd } from './download-release'
import * as path from 'path'
import * as fs from 'fs'
import { rimraf } from 'rimraf'
import { downloadFile } from 'ipull'
import extract from 'extract-zip'
import * as tar from 'tar'
async function downloadZstd(options: {
  tag: string
  fileName: string
  // outFilePath: string
}) {
  let tempPath = path.join(process.cwd(), '../temp')
  let outputPath = path.join(process.cwd(), '../zstd-dir')

  let url = `https://github.com/facebook/zstd/releases/download/${options.tag}/${options.fileName}`
  console.log('准备下载', url)

  let result = await downloadFile({ url: url, savePath: tempPath })
  // console.log(result)
  await result.download()
  console.log('下载完成', tempPath)
  console.log(fs.existsSync(tempPath))

  if (options.fileName.endsWith('.zip')) {
    console.log('准备解压', outputPath)

    await extract(tempPath, { dir: outputPath })
    console.log('解压完成', outputPath)
  }
  return outputPath
}
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    console.log('env', process.env)

    let cwd = await downloadZstd({
      tag: 'v1.5.7',
      fileName: 'zstd-v1.5.7-win64.zip'
    })
    console.log(process.cwd())
    // todo execa执行zstd
    let result = fs.readdirSync(cwd)
    console.log(result)
    const dir = core.getInput('dir')

    if (dir) {
      const cleanPaths = core.getInput('cleanPaths', { required: false })
      console.log('清理', cleanPaths)

      // rimraf([], { glob: { cwd: dir } })
    }
    const outputPath = core.getInput('outputPath')
    const absOutputPath = path.join(process.cwd(), outputPath)
    tar.c({ sync: true }, [dir]).pipe(fs.createWriteStream(absOutputPath))
    let res2 = fs.existsSync(absOutputPath)
    console.log('是否存在', absOutputPath, res2)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
