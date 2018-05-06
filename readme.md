**A simple script that downloads albums from VGMPF**

VGMPF has video game music music downloads, but usually doesn't provide full album downloads. Since it's annoying to have to manually `wget` every track, I built this small script to do it quickly.

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
