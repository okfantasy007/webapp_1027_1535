# -*- coding: utf-8 -*-

# ubuntu 16.04
# sudo pip install -i https://pypi.tuna.tsinghua.edu.cn/simple Pillow

import os
import glob
from PIL import Image
import colorsys
import sys

def convert_solo_png(filein,fileout, rx,gx,bx):
    try:
        org = Image.open(filein)
        im = org.convert('RGBA')
        
        c = Image.new("RGBA",im.size)
        (w,h) = im.size
        if w>64 or h>64:
            return
        for i in range(w):
            for j in range(h):
                r,g,b,a = im.getpixel((i,j))
                t = (r+g+b)/3
                rgba = ( int(t*rx), int(t*gx), int(t*bx), a)
                c.putpixel([i,j],rgba)
        c.save(fileout)
    except Exception,e:
        print "convert '%s' failed!" % filein
        print str(e)
       

def gif2png(in_fn):
    try:
        sfn = in_fn.split(".")
        del sfn[-1]
        base_fn = ".".join(sfn)
        out_fn = base_fn+".png"
        print "---> %s" % in_fn    
        print "<--- %s" % out_fn    

        im = Image.open(in_fn)
        print im.format, im.size, im.mode
        png = im.convert('RGBA')
        png.save(out_fn,'png')
        return out_fn
    except:
        print "gif2png '%s' faild!" % in_fn
        

def convert_pic(in_fn):
    try:
        sfn = in_fn.split(".")
        del sfn[-1]
        base_fn = ".".join(sfn)
        convert_solo_png(in_fn, "%s_0.png" % base_fn, 0.2, 1.2, 0.2)
        convert_solo_png(in_fn, "%s_1.png" % base_fn, 2.8, 0.65, 0.65)
        convert_solo_png(in_fn, "%s_2.png" % base_fn, 2.2, 0.8, 0.0)
        convert_solo_png(in_fn, "%s_3.png" % base_fn, 1.35, 1.35, 0.2)
        convert_solo_png(in_fn, "%s_4.png" % base_fn, 0.7, 0.7, 1.5)
        convert_solo_png(in_fn, "%s_5.png" % base_fn, 1.0, 1.0, 1.0)
    except Exception,e:
        print str(e)
    
def search_dir(rootdir):
    print "<%s>" % rootdir
    for fn in glob.glob(rootdir+"/*"):
        print fn
        if os.path.isdir( fn ):
            print "<%s>" % fn
            search_dir( fn )
        else:
            if fn.split(".")[-1].upper() == 'GIF':
                try:
                    convert_pic( gif2png(fn) )
                except:
                    pass
            elif fn.split(".")[-1].upper() == 'PNG':
                try:
                    convert_pic( fn )
                except:
                    pass

#search_dir(r"D:\share\NNM_resource\resource\newtopo\image\32X32")
search_dir("/home/xjp/Downloads/newicon")
