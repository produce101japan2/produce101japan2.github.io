BIRTH_FILE=birth_origin.txt

curl -s https://gyao.yahoo.co.jp/specials/produce101-vote | xmllint --html --xpath '/*/body/script[@id="__NEXT_DATA__"]/text()' -  2>/dev/null  | jq  -r '.props.pageProps.page.p101.election.candidates[].profile | .name + "," + .birthday + "," + .origin ' > $BIRTH_FILE

while read line
do
 trainee=`echo $line | awk -F "," '{print $2}' | sed -e "s/ //g"`
 data=`cat $BIRTH_FILE | sed -e "s/ //g" | grep "$trainee"`

 if [ "$data" == "NULL" ]; then
   #TODO
   echo $line
 else
   birth=`echo $data | awk -F "," '{print $2}' | sed -e "s/(.*)//g" | sed -e "s/年\([1-9]\)月/年0\1月/" | sed -e "s/月\([1-9]\)日/月0\1日/" | tr "年月" "/" | sed -e "s/日//g"`
   origin=`echo $data | awk -F "," '{print $3}'`
   echo "${line},${birth},${origin}" | awk -F "," '{print $1","$2","$3","$12","$5","$6","$7","$13","$8","$9","$10","$11}'
 fi

done < ../trainee_info.csv

rm $BIRTH_FILE
