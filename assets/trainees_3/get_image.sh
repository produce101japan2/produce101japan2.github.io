while read line
do
 t=`echo ${line} | awk -F "," '{print $1}'`
 echo ${t}
 wget "https://produce101.jp/shared/p101s2/img/profile/photo/${t}_3.jpg"
 mv ${t}_3.jpg ${t}.jpg
done < $1

