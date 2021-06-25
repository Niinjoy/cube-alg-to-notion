import urllib.request, csv
import pandas as pd

algset = "PLL" # F2L, OLL, PLL
normalview = "http://cube.rider.biz/visualcube.php?fmt=svg&bg=t&stage=f2l&r=y35x-25&case=" # for F2L
planview = "http://cube.rider.biz/visualcube.php?fmt=svg&view=plan&bg=t&fc="
dic = csv.DictReader(open('csv/'+algset+'.csv', newline=''))

if algset != "F2L":
	for row in dic:
		urllib.request.urlretrieve(planview+row["fc"], "cubeImg/"+algset+"/"+row["name"]+".svg")
else:
	all_visuals = []
	for row in dic:
		if row["ori"] == "0":
			alts = [row["alt1"], row["alt2"], row["alt3"], row["alt4"]]
			# for F2L, get alg not contain 'y' or 'd' for visualize
			algvisual = next((x for x in alts if "y" not in x and "d" not in x), None)
			urllib.request.urlretrieve(normalview+algvisual.replace(" ", ""), "cubeImg/"+algset+"/"+row["name"]+".svg")
			all_visuals.append({
				"name":row["name"],
				"algvisual":algvisual
			})
		else:
			# add "y'"*n when has orientation
			urllib.request.urlretrieve(normalview+"y'"*int(row["ori"])+algvisual.replace(" ", ""), "cubeImg/"+algset+"/"+row["name"]+".svg")
	# for F2L, log alg for visual
	keys = all_visuals[0].keys()
	pd.DataFrame(all_visuals,columns=keys).to_csv('csv/'+algset+'algvisual.csv', encoding='utf-8',index=False) 