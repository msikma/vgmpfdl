/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

import fs from 'fs'
import request from 'request'

/**
 * Downloads a file.
 */
export const downloadFile = (src, dest) => (
  new Promise((resolve, reject) => {
    const destStream = fs.createWriteStream(dest, { flags: 'w', encoding: null })
    destStream.on('finish', () => resolve())
    destStream.on('error', (err) => reject(err))
    request(src).pipe(destStream)
  })
)
