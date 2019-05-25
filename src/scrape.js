/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import mkdirp from 'mkdirp'
import { requestURI } from './util'

import { downloadFile } from './download'
import {
  absUrl,
  formatKey,
  getExtension,
  makeDirName,
  makeFileName,
  makeGameTable,
  logTracksTable,
  reportDestDir,
  reportDownload,
  reportErr
} from './util'

// Valid URL we can scrape.
const VGMPF_URL = [
  new RegExp('vgmpf\\.com/Wiki/index\\.php\\?title=(.+?)', 'i'),
  new RegExp('vgmpf\\.com/Wiki/index\\.php/(.+?)', 'i')
]
// Color of the header that contains the game title.
const HEADER_COLOR = '#402070'

// Displays an error if we couldn't make a path.
const pathError = (err) => {
  if (err) {
    console.log(`vgmpfdl: error: Could not create path`)
    process.exit(1)
  }
}

export const isVGMPFUrl = (url) => (
  VGMPF_URL.map(re => re.test(url)).indexOf(true) > -1
)

export const downloadVGMPFUrl = async (url, showComposers) => {
  const html = await requestURI(url)
  const $ = cheerio.load(html.body)

  // Retrieve the list of tracks.
  const $content = $('#mw-content-text')

  // Attempt to determine if there's a list of output prefixes.
  // For example, an article might have four different recordings of the soundtrack,
  // one using OPL2, one using Gravis, etc.
  // If we find an ordered list with the same amount of items as the track tables we've found,
  // we'll assume that this ordered list contains the various different chips.
  const $ols = $('ol', $content)
  // Produces e.g. 
  //    [ [ '- Gravis UltraSound (using original patch set)',
  //        '- Gravis UltraSound (using "Pro Patches Lite" v1.60 )',
  //        '- Roland SoundCanvas (General MIDI / Wave Blaster)',
  //        '- OPL2 (Sound Blaster / Ad Lib)' ] ]
  const ols = $ols.get().map(ol => $('li', ol).get().map(li => $(li).text().trim()))

  // Determine which columns we have. Also define a quick helper function for getting the right column index.
  const cols = $('.wikitable tr:first-child th').map((n, el) => $(el).text().trim()).get()
  const findCol = str => (cols.indexOf(str) + 1)
  const $tables = $('.wikitable', $content)
  // See if we have a list of recording groups.
  const groups = $tables.get().length > 1 && ols.length ? ols.find(ol => ol.length === $tables.get().length) : []

  const trackGroups = $tables.get().map((table, n) => {
    const group = groups.length >= n + 1 ? groups[n] : ''
    const $trs = $('tr[itemtype="http://schema.org/MusicComposition"]', table)
    const tracks = $trs.map((_, el) => {
      const trackN = $(`td:nth-child(${findCol('#')})`, el).text().trim()
      const title = $(`td:nth-child(${findCol('Title')})`, el).text().trim()
      const composer = $(`td:nth-child(${findCol('Composer')})`, el).text().trim()
      const length = $(`td:nth-child(${findCol('Length')})`, el).text().trim()
      const url = absUrl($(`td:nth-child(${findCol('Download')}) a`, el).attr('href').trim())
      const album = $(`td:nth-child(${findCol('Download')}) span[itemprop="inAlbum"] meta[itemprop="name"]`, el).attr('content').trim()
      return {
        group,
        trackN,
        title,
        composer,
        length,
        url,
        album
      }
    })
    return {
      group,
      tracks: tracks.get()
    }
  })

  const tracks = trackGroups.reduce((all, group) => [...all, ...group.tracks], [])

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
    .map((_, el) => ({ [formatKey($('td:nth-child(1)', el).text().trim())]: $('td:nth-child(2)', el).text().trim() }))
    .get()
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})

  const gameTitle = $gameTitle.text().trim()
  const gameImage = absUrl($('a.image img', $gameBox).attr('src').trim())
  const dirPathBase = `${process.cwd()}/`

  console.log(makeGameTable(gameTitle, gameInfo, composers).toString())
  logTracksTable(trackGroups)

  // Download all tracks. Let's be nice and do it one at a time.
  for (const group of trackGroups) {
    const dirName = makeDirName(gameTitle, gameInfo, showComposers ? composers : [], group.group)
    const dirPath = `${dirPathBase}${dirName}`
    reportDestDir(dirPath)
    mkdirp(dirPath, pathError)
    for (const track of group.tracks) {
      // Retry each track a number of times.
      for (let a = 0; a < 5; ++a) {
        const ext = getExtension(track.url)
        const fn = makeFileName(track.trackN, track.title, ext)
        const dest = `${dirPath}/${fn}`
        try {
          await downloadFile(track.url, dest)
          reportDownload(dest)
          break
        }
        catch (err) {
          reportErr(err, dest, a, 5)
        }
      }
    }

    // Download the cover image to 'folder.ext'.
    const ext = getExtension(gameImage)
    const dest = `${dirPath}/folder.${ext}`
    await downloadFile(gameImage, dest)
    reportDownload(dest)
  }
}
