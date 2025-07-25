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
    let cwd = process.cwd()
    console.log('cwd', cwd)
    const dir = core.getInput('dir')
    let absDir = path.join(cwd, dir)
    console.log('absDir', absDir)
    /** 清理无用 */
    const cleanPaths = core.getMultilineInput('cleanPaths', { required: false })
    if (cleanPaths) {
      console.log('清理', cleanPaths)
      if (cleanPaths.length) {
        await rimraf(cleanPaths, { glob: { cwd: absDir, dot: true } })
      }
    }
    /** tar */
    let tempTar = path.join(cwd, '../output-temp.tar')
    let absDirDir = path.dirname(absDir)
    let dirname = path.basename(absDir)
    await tar.c({ file: tempTar, cwd: absDirDir }, [dirname])
    /** zstd */
    const outputPath = core.getInput('outputPath')
    const absOutputPath = path.join(cwd, outputPath)

    let level = core.getInput('zstdLevel')
    let command = [tempTar, '-o', absOutputPath, '-T0', `-${level}`]
    console.log('command', command)
    if (process.platform === 'win32') {
      console.log('准备下载zstd')
      let cwd = await downloadZstd({
        tag: 'v1.5.7',
        fileName: 'zstd-v1.5.7-win64.zip'
      })
      console.log('准备压缩')
      await $({ cwd: cwd })(`zstd.exe`, command)
    } else if (process.platform === 'linux') {
      console.log('准备压缩')
      await $({ stdio: 'inherit', shell: true, cwd: cwd })(`zstd`, command)
    }
  } catch (error) {
    console.log(error)

    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
