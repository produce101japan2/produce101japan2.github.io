# get from profile page
while read line
do
  file=`echo $line | awk -F "," '{print $1}'`
  rank=`curl -s https://produce101.jp/profile/data2021.php?id=${file} | awk 'NR==8'`
  if [ "${rank}" != "NULL" ]; then
    echo "${file},${rank}"
  fi
done < ../trainee_info.csv

