import requests
from bs4 import BeautifulSoup 
import pandas as pd

algset = "PLL" # F2L, OLL, PLL
def get_data(algsets):
    all_algs = []
    for algset in algsets:
        url = "https://www.speedcubedb.com/a/3x3/"+algset
        res = requests.get(url)
        soup = BeautifulSoup(res.content,'html.parser')

        datas = soup.select('div.row.mt-2.pt-3.mb-2.pb-3.singlealg.border-bottom')
        # for index, data in enumerate([datas[0]]):
        for index, data in enumerate(datas):
            case = data.find('h3').text
            catalog = data.find('h5').text

            # video link and image (the later one)
            if data.select('li.list-group-item.text-center') != []:
                video = data.select('li.list-group-item.text-center')[-1]
                vlink = video.find('a')['href']
                vimg = video.find('img')['src']
            else:
                vlink = ""
                vimg = ""

            # face color info for plain view like OLL and PLL
            if data.select('div.jcube') !=[]:
                img_raw = data.select('div.jcube')[0]
                fc = img_raw['data-us']+img_raw['data-ur']+img_raw['data-uf']+'wwwwwwwww'+img_raw['data-ul']+img_raw['data-ub']
            else:
                fc = ""

            # F2L has 4 orientations (0,1,2,3), others 1 (0)
            if algset == "F2L":
                ori_range = range(0,4)
            else:
                ori_range = range(0,1)
            
            # algorithms
            for ori in ori_range:
                alg = [i.text for i in data.select('div[data-ori="'+str(ori)+'"]')[0].select('span')]
                alg.extend([""]*(4-len(alg)))
                if ori == 0:
                    oriname = ""
                else:
                    oriname = "-" + str(ori)
                    vlink = ""
                    vimg = ""
                all_algs.append({
                    "name":algset + "%02d" % (index+1) + oriname,
                    "algset":algset,
                    "case":case,
                    "catalog":catalog,
                    "alg1":alg[0],
                    "alg2":alg[1],
                    "alg3":alg[2],
                    "alg4":alg[3],
                    "video_link":vlink,
                    "video_image":vimg,
                    "face_color":fc,
                    "orientation":ori
            })          
    return all_algs

def main():
    algsets = ["F2L", "OLL", "PLL"]

    # save as csv
    all_algs = get_data(algsets)
    keys = all_algs[0].keys()
    pd.DataFrame(all_algs,columns=keys).to_csv('csv/all_algs.csv', encoding='utf-8',index=False)

if __name__ == "__main__":
    main()
