/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

import requestAsBrowser from 'requestAsBrowser'
import cheerio from 'cheerio'
import mkdirp from 'mkdirp'

import { downloadFile } from './download'
import {
  absUrl,
  formatKey,
  getExtension,
  makeDirName,
  makeFileName,
  makeGameTable,
  makeTracksTable,
  reportDestDir,
  reportDownload
} from './util'

// Valid URL we can scrape.
const VGMPF_URL = new RegExp('vgmpf\\.com/Wiki/index\\.php\\?title=(.+?)', 'i')
// Color of the header that contains the game title.
const HEADER_COLOR = '#402070'

export const isVGMPFUrl = (url) => (
  VGMPF_URL.test(url)
)

export const downloadVGMPFUrl = async (url) => {
  const html = await requestAsBrowser(url)
  const $ = cheerio.load(html.body)

  // Retrieve the list of tracks.
  const $content = $('#mw-content-text')

  // Determine which columns we have. Also define a quick helper function for getting the right column index.
  const cols = $('.wikitable tr:first-child th').map((n, el) => $(el).text().trim()).get()
  const findCol = str => (cols.indexOf(str) + 1)
  const tracks = $('.wikitable tr[itemtype="http://schema.org/MusicComposition"]', $content).map((n, el) => {
    const trackN = $(`td:nth-child(${findCol('#')})`, el).text().trim()
    const title = $(`td:nth-child(${findCol('Title')})`, el).text().trim()
    const composer = $(`td:nth-child(${findCol('Composer')})`, el).text().trim()
    const length = $(`td:nth-child(${findCol('Length')})`, el).text().trim()
    const url = absUrl($(`td:nth-child(${findCol('Download')}) a`, el).attr('href').trim())
    const album = $(`td:nth-child(${findCol('Download')}) span[itemprop="inAlbum"] meta[itemprop="name"]`, el).attr('content').trim()
    return {
      trackN,
      title,
      composer,
      length,
      url,
      album
    }
  }).get()

  // Retrieve list of composers, sorted by most number of credited tracks.
  const composerNum = tracks.reduce((acc, curr) => ({ [curr.composer]: acc[curr.composer] ? acc[curr.composer] + 1 : 1 }), {})
  const composers = Object.keys(composerNum).sort((a, b) => composerNum[a] < composerNum[b])

  // Retrieve main game information table. There's no clean way to do this,
  // but the color we search for is at least locked and doesn't seem like it will change soon.
  const $gameTitle = $(`td[style*="${HEADER_COLOR}"]`).slice(0, 1)
  // Then traverse up to its containing table.
  const $gameBox = $gameTitle.parents('table')

  // This is guaranteed to be the third <tr> by the Wikitemplate.
  const gameInfo = $('tr:nth-child(3) table tr', $gameBox)
    .map((n, el) => ({ [formatKey($('td:nth-child(1)', el).text().trim())]: $('td:nth-child(2)', el).text().trim() }))
    .get()
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})

  const gameTitle = $gameTitle.text().trim()
  const gameImage = absUrl($('a.image img', $gameBox).attr('src').trim())
  const dirName = makeDirName(gameTitle, gameInfo)
  const dirPath = `${process.cwd()}/${dirName}/`

  console.log(makeGameTable(gameTitle, gameInfo).toString())
  console.log(makeTracksTable(tracks).toString())
  reportDestDir(dirPath)

  // Start saving files.
  mkdirp(dirPath, (err) => {
    if (err) {
      console.log(`vgmpfdl: error: Could not create path`)
      process.exit(1)
    }
  })

  // Download all tracks. Let's be nice and do it one at a time.
  for (const track of tracks) {
    const ext = getExtension(track.url)
    const fn = makeFileName(track.trackN, track.title, ext)
    const dest = `${dirPath}${fn}`
    await downloadFile(track.url, dest)
    reportDownload(dest)
  }

  // Download the cover image to 'folder.ext'.
  const ext = getExtension(gameImage)
  const dest = `${dirPath}folder.${ext}`
  await downloadFile(gameImage, dest)
  reportDownload(dest)
}
