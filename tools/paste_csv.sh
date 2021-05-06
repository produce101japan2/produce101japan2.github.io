#paste ../trainee_info.csv <(sh get_rank.sh | awk -F "," '{if($2>60){print $2}else{print "1"}}') | awk -F "\t" '{if($2==""){print $1",101"}else{print $1","$2}}'
#paste ../trainee_info.csv <(sh get_rank.sh | awk -F "," '{print $2}') | awk -F "\t" '{if($2==""){print $1","$12}else{print $1","$2}}'
join -a 1 -t, ../trainee_info.csv <(sh get_rank2.sh) | rev | awk -F "," '{if($15==""){print $1","$0}else{print}}' | rev
