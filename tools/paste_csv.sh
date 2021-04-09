#paste ../trainee_info.csv <(sh get_rank.sh | awk -F "," '{if($2>60){print $2}else{print "1"}}') | awk -F "\t" '{if($2==""){print $1",101"}else{print $1","$2}}'
paste ../trainee_info.csv <(sh get_rank.sh | awk -F "," '{print $2}') | awk -F "\t" '{if($2==""){print $1",101"}else{print $1","$2}}'
