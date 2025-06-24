import * as core from '@actions/core'
// import { downloadZstd } from './download-release'
import * as path from 'path'
import * as fs from 'fs'
import { rimraf } from 'rimraf'
import { downloadFile } from 'ipull'
import extract from 'extract-zip'
import * as tar from 'tar'
import { arch, cpus, platform, tmpdir } from 'os'
import { $ } from 'execa'
import { cpuUsage, env, memoryUsage } from 'process'
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
  return path.join(outputPath, 'zstd-v1.5.7-win64')
}
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    console.log('env', process.env)
    // console.log(cpus())
    // console.log(cpuUsage())
    // console.log(memoryUsage())

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
      let list = cleanPaths.split(/\n|\r\n/).map((item) => item.trim())
      console.log('清理', list)
      if (list.length) {
        await rimraf(list, { glob: { cwd: dir } })
      }
    }
    const outputPath = core.getInput('outputPath')
    fs.mkdirSync(path.join(process.cwd(), '../temp'), { recursive: true })
    let tempTar = path.join(process.cwd(), '../temp/temp.tar')
    console.log('临时', tempTar)
    // let tempFileStream = fs.createWriteStream(tempTar)
    // tar.c({}, [dir]).pipe(tempFileStream)
    await tar.create({ file: tempTar }, [dir])
    // await new Promise<void>((resolve, reject) => {
    //   tempFileStream.on('finish', resolve)
    //   tempFileStream.on('error', reject)
    // })
    let res2 = fs.existsSync(tempTar)
    console.log('是否存在', tempTar, res2)
    const absOutputPath = path.join(process.cwd(), outputPath)
    if (`${platform()}` === 'win32') {
      console.log('准备压缩')
      console.log('命令', `zstd ${tempTar} -o ${absOutputPath} -T0 -1`)

      await $({ cwd: cwd })(`zstd.exe ${tempTar} -o ${absOutputPath} -T0 -1`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
