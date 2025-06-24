import { BearerCredentialHandler } from 'typed-rest-client/Handlers'
import * as thc from 'typed-rest-client/HttpClient'
import { ReleaseDownloader } from './release-downloader'

export async function downloadZstd(options: {
  tag: string
  fileName: string
  // outFilePath: string
}) {
  const credentialHandler = new BearerCredentialHandler('', false)
  const client = new thc.HttpClient('gh-api-client', [credentialHandler])
  const downloader = new ReleaseDownloader(client, 'https://api.github.com')
  await downloader.download({
    ...options,
    sourceRepoPath: 'facebook/zstd',
    // tag: 'v1.5.7',
    // fileName: 'zstd-v1.5.7-win64.zip',
    outFilePath: '../zstd',
    isLatest: false,
    preRelease: false,
    tarBall: false,
    zipBall: false,
    extractAssets: true,
    id: ''
  })
}
