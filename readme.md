## `vgmpfdl`

A simple script that downloads albums from [VGMPF](http://www.vgmpf.com/Wiki/index.php?title=Main_Page).

The VGMPF (Video Game Music Preservation Foundation) has video game music music downloads, but usually doesn't provide full album downloads. Since it's annoying to have to manually `wget` every track, I built this small script to do it quickly.

Some albums have multiple recordings, especially DOS games that support multiple sound cards. For example, [Zorro (DOS)](http://www.vgmpf.com/Wiki/index.php?title=Zorro_(DOS)). If the article contains **a numbered list with the names of the recording options**, these options will be added to the output directory names. In that case each recording will also be a separate download rather than one large album.

## Usage

Install globally:

```
npm i -g vgmpfdl
```

Then change directory to wherever you want to save the album, and type the following:

```
vgmpfdl "url to vgmpf page"
```

E.g. [a page like this](http://www.vgmpf.com/Wiki/index.php?title=Pickle_Wars_(DOS)).

## Copyright

MIT license.
