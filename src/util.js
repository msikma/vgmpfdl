/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

import sanitize from 'sanitize-filename'
import Table from 'cli-table2'
import request from 'request'
import chalk from 'chalk'

const VGMPF_BASE = 'http://www.vgmpf.com'

// Returns the name of the file we'll save for a single track.
export const makeFileName = (n, title, ext) => (
  sanitize(`${n} - ${title}.${ext}`)
)

// Makes a URL absolute if it isn't already.
export const absUrl = (url) => (
  url.startsWith(VGMPF_BASE) ? url : `${VGMPF_BASE}${url}`
)

// Returns the file extension of a URL.
export const getExtension = (url) => (
  url.split('.').pop()
)

// Reports that a file has been downloaded.
export const reportDownload = (dest) => {
  const destShort = dest.split('/').pop()
  console.log(`vgmpfdl: Downloaded file: ${chalk.red(destShort)}`)
}

// Reports the destination directory.
export const reportDestDir = (dir) => (
  console.log(`vgmpfdl: Saving to ${chalk.red(dir)}`)
)

/**
 * Returns the name of the directory we'll download the files to.
 */
export const makeDirName = (title, info, composers, group) => {
  const segments = [title]
  if (info.platform && info.year) {
    segments.push(`(${info.platform}, ${info.year})`)
  }
  else if (info.platform) {
    segments.push(`(${info.platform})`)
  }
  else if (info.year) {
    segments.push(`(${info.year})`)
  }
  if (composers && composers.length) {
    segments.push(composers.join(', '))
  }
  if (info.developer) {
    segments.push(`[${info.developer}]`)
  }
  if (group) {
    segments.push(`[${group.replace(/^\s?-\s?/, '')}]`)
  }
  return sanitize(segments.join(' '))
}

/**
 * Turns a table key like 'Developer:' into 'developer'.
 */
export const formatKey = (str) => (
  str.split(':').join('').toLowerCase()
)

/**
 * Make a table containing basic game information.
 */
export const makeGameTable = (title, info, composers) => {
  const table = new Table()
  table.push(
    { [chalk.red('Title')]: title },
    ...(info.platform ? [{ [chalk.red('Platform')]: info.platform }] : []),
    ...(info.year ? [{ [chalk.red('Year')]: info.year }] : []),
    ...(info.developer ? [{ [chalk.red('Developer')]: info.developer }] : [])
  )
  if (composers) {
    table.push({ [chalk.red(`Composer${composers.length !== 1 ? `s` : ``}`)]: composers.join(', ') })
  }
  return table
}

/**
 * Make a table out of the tracks we found.
 */
export const logTracksTable = (trackGroups) => {
  const allTables = []
  for (const group of trackGroups) {
    const table = new Table({ head: ['#', 'Title', 'Composer', 'Length'] })
    for (const track of group.tracks) {
      table.push([track.trackN, track.title, track.composer, track.length])
    }
    allTables.push([group.group, table.toString()])
  }
  // Now log all tables with a group header.
  // This is a pretty big hack, because we can't span columns with cli-table.
  for (const table of allTables) {
    const groupName = table[0]
    const tableString = table[1]
    // Here's the big hack to get the size of the table.
    const rowLength = tableString.split('\n')[0].replace(/[^┌─┐┬]/g, '')
    if (groupName) {
      const tableObj = new Table({ colWidths: [rowLength.length - 2] })
      tableObj.push([chalk.yellow(groupName.replace(/^\s?-\s?/, ''))])
      console.log(tableObj.toString())
    }
    console.log(tableString)
  }
}

// Headers similar to what a regular browser would send.
export const browserHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
}
// Default settings for requests.
const requestDefaults = {
  gzip: true
}

// Requests a URI using our specified browser headers as defaults.
// This function has a higher chance of being permitted by the source site
// since it's designed to look like a normal browser request rather than a script.
export const requestURI = (url, headers = {}, etc = {}) => new Promise((resolve, reject) => (
  request(
    { url, headers: { ...browserHeaders, ...(headers != null ? headers : {}) }, ...requestDefaults, ...etc },
    (err, res) => {
      if (err) return reject(err)
      resolve(res)
    }
  )
))
