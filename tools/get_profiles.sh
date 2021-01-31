
while read line
do
  file=`echo $line | awk -F "," '{print $1}'`
  data=`curl -s  https://produce101.jp/profile/$file |  xmllint --html --xpath '//*[@class="profile-outline"]/div[@class="text"]/*' - 2>/dev/null | grep -v "dt" | sed 's/<span>/\'$'\n/g' | sed -e "s/<[^>]*>//g" | awk '{$1=$1;print}' | sed -e "s///g" | tr -s ',' '、' | sed -e "s/\&amp;/\&/g" |tr -s '\n' ',' `
  echo "${file},${data}f,1"
done < $1

