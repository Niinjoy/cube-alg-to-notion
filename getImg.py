# generating image for F2L (4 orientations), OLL, PLL. No need to genereate again
# for OLL and PLL, use face_color from SpeedCubeDB
# for F2L, get alg not contain 'y' or 'd' for visualize
import urllib.request, csv

normalview = "http://cube.rider.biz/visualcube.php?fmt=svg&bg=t&stage=f2l&r=y35x-25&case=" # for F2L
planview = "http://cube.rider.biz/visualcube.php?fmt=svg&view=plan&bg=t&fc="
dic = csv.DictReader(open('asset/allAlgs.csv', newline=''))

for row in dic:
    img_path = "cubeImg/"+row["algset"]+"/"+row["name"]+".svg"
    if row["algset"] != "F2L":
        urllib.request.urlretrieve(planview+row["face_color"], img_path)
    else:
        if row["orientation"] == "0":
            algs = [row["alg1"], row["alg2"], row["alg3"], row["alg4"]]
            # for F2L, get alg not contain 'y' or 'd' for visualize
            algvisual = next((x for x in algs if "y" not in x and "d" not in x), None)
            if algvisual == None:
                print("Need fix: all algs for "+row["name"]+" contains rotation.") # need to add y or y' at the end of alg
        # add "y'"*n for orientation != 0
        urllib.request.urlretrieve(normalview+"y'"*int(row["orientation"])+algvisual.replace(" ", ""), img_path)