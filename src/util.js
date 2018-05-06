/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

import sanitize from 'sanitize-filename'
import Table from 'cli-table2'
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
  console.log(`vgmpfdl: Szaving to ${chalk.red(dir)}`)
)

/**
 * Returns the name of the directory we'll download the files to.
 */
export const makeDirName = (title, info, composers) => {
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
  if (composers) {
    segments.push(composers.join(', '))
  }
  if (info.developer) {
    segments.push(`[${info.developer}]`)
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
export const makeGameTable = (title, info) => {
  const table = new Table()
  table.push(
    { [chalk.red('Title')]: title },
    ...(info.platform ? [{ [chalk.red('Platform')]: info.platform }] : []),
    ...(info.year ? [{ [chalk.red('Year')]: info.year }] : []),
    ...(info.developer ? [{ [chalk.red('Developer')]: info.developer }] : [])
  )
  return table
}

/**
 * Make a table out of the tracks we found.
 */
export const makeTracksTable = (tracks) => {
  const table = new Table({ head: ['#', 'Title', 'Composer', 'Length'] })
  for (const track of tracks) {
    table.push([track.trackN, track.title, track.composer, track.length])
  }
  return table
}
