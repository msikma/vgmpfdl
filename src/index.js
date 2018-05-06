/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

import { isVGMPFUrl, downloadVGMPFUrl } from './scrape'

export const run = async (args) => {
  const { urls } = args
  let exitCode = 0

  if (urls.length === 0) {
    console.log(`vgmpfdl: error: no URL entered`)
    process.exit(1)
  }

  try {
    for (const url of urls) {
      if (isVGMPFUrl(url)) {
        await downloadVGMPFUrl(url)
      }
      else {
        console.log(`vgmpfdl: error: not a recognized URL scheme: ${url}`)
        exitCode = 1
      }
    }
  }
  catch (err) {
    if (err.statusCode === 404) {
      console.log(`vgmpfdl: error: given URL returned a page not found error (404)`)
      exitCode = 1
    }
    else {
      console.log(`ascr: error: ${err.stack}`)
      exitCode = 1
    }
  }
  return process.exit(exitCode)
}
