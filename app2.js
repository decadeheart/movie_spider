const request=require("superagent")  
const cheerio=require("cheerio")  
const  mysql=require('mysql')  

const userAgents = [
  'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12',
  'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; SLCC1; .NET CLR 2.0.50727; Media Center PC 5.0; .NET CLR 3.0.04506)',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20',
  'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER',
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET CLR 2.0.50727; Media Center PC 6.0) ,Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/1.2.9',
  'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)',
  'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:2.0b13pre) Gecko/20110307 Firefox/4.0b13pre',
  'Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr) Presto/2.9.168 Version/11.52',
  'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12',
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)',
  'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6',
  'Mozilla/5.0 (X11; U; Linux; en-US) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.6',
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)',
  'Opera/9.25 (Windows NT 5.1; U; en), Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/1.2.9',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
]
var idArray=[]

var connection = mysql.createConnection({  //配置参数，然后添加你的数据库里面的表
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'movies'
})
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }else{
    console.log('connected as id ' + connection.threadId);
    //获取历史
    //getId(getDetail)
    //获取实时
    getOtherId(getDetail)
  }
 

});  //连接

function show(item){
  request('https://movie.douban.com/top250?start='+`${(item-1)*25}`,function(err,res){  
      if(err){  
          console.log('请求出错');  
      }else{ 
          console.log(item) 
          var $ = cheerio.load(res.body, {decodeEntities: false});
          console.log($('.grid_view'))
          $('.grid_view').find('li').each(function(){

              let info = $(this).find('.info')
              let pic = $(this).find('.pic')
 
              const score = info.find('.rating_num').text()
              const name = info.find('.title').text()
              const imgUrl = pic.find('a').children('img').attr('src')
              var addSql = "insert into douban(score,name,imgUrl) values (?,?,?)"; 
              var addParmas = [score,name,imgUrl];
              //console.log(addParmas)
              connection.query(addSql,addParmas,function(err,results,data){
                if(err){  
                  console.log(err)
                    //console.log("数据库连接错误");  
                }else{
                  console.log('正在导入')
                }
              })  
          }); 
      }  
  });
}
function getUserImage(item){
          var nameArray = []
        var picArray = []
         var userUrl = 'https://piaofang.maoyan.com/movie/'+item+'/wantindex?wkwebview=1&city_tier=0&city_id=0&cityName=全国'
        var movieName = ''
         //爬取用户画像      
        request.get(userUrl)
        .set({ 'User-Agent': userAgents })
        .timeout({ response: 5000, deadline: 60000 })
        .end((err, res)=>{
              // 处理数据
          if (err) {
            console.log(`爬取页面失败，${err}`)
            return
          }
          let $ = cheerio.load(res.text, {decodeEntities: false});
          var manStr=$('.stackcolumn-rate').find('.left').attr('style')
          if(manStr){
          
          //匹配小数
          manStr = manStr.match(/\d+(\.\d+)?/)[0];
          var girlStr=$('.stackcolumn-rate').find('.right').attr('style')
          girlStr = girlStr.match(/\d+(\.\d+)?/)[0];
          var genderStr = '男,'+manStr+',女,'+girlStr
          }
          var upStr=$('.green').find('.left').attr('style')
          if(upStr){
          upStr = upStr.match(/\d+(\.\d+)?/)[0];
          var downStr=$('.green').find('.right').attr('style')
          downStr = downStr.match(/\d+(\.\d+)?/)[0];  
          var eduStr = '本科以上,'+upStr+',本科以下,'+downStr  
          }
          var areaData=$('.linebars-value').text()
          areaData=areaData.replace(/\%/g,",")
          $('.scroll-main').find('.item-pic').each(function(){
            var movieName = $(this).attr('alt')
            
            nameArray.push(movieName)

            var picUrl = $(this).attr('data-src')
            picArray.push(picUrl)
          });
          var nameList = nameArray.join(',')
          var picLsit = picArray.join(',')
          updateParmas = [genderStr,eduStr,areaData,nameList,picLsit,item]
          var updateSql='update maoyan set genderStr = ?,eduStr = ?,areaData = ?,nameList = ?,picLsit = ? where id = ? '
          connection.query(updateSql,updateParmas,function(err,results,data){
            if(err){  
              console.log(err)
            }else{
              console.log('正在更新'+item)
            }
          })       
        })
}

function getWord(item){
 var userUrl = 'https://piaofang.maoyan.com/movie/'+item+'/audienceRating?usePageCache=true'
  //爬取用户画像      
  request.get(userUrl)
  .set({ 'User-Agent': userAgents })
  .timeout({ response: 5000, deadline: 60000 })
  .end((err, res)=>{
        // 处理数据
    if (err) {
      console.log(`爬取页面失败，${err}`)
      return
    }
    let $ = cheerio.load(res.text, {decodeEntities: false});
    let wordCount = $('.movie-tags')
    var words = []
    wordCount.find('span').each(function(){
      var word=$(this).html()
      words.push(word)
    })
    if(words){
      words = words.join(',')
      updateParmas = [words,item]
      var updateSql='update maoyan set words = ?where id = ? '
      connection.query(updateSql,updateParmas,function(err,results,data){
        if(err){  
          console.log(err)
        }else{
          console.log('正在更新'+item)
        }
      })  
    }     
  })
}

function getDetail(){
  for(var i=0;i<idArray.length;i++){
    var url = 'https://piaofang.maoyan.com/movie/'+`${idArray[i]}`
    
    request.get(url)
    .set({ 'User-Agent': userAgents })
    .timeout({ response: 5000, deadline: 60000 })
    .end((err, res)=>{
          // 处理数据
      if (err) {
        console.log(`爬取页面失败，${err}`)
        return
      }
      let $ = cheerio.load(res.text, {decodeEntities: false});
      let title = $('.info-title-content').text()
      let effect = $('.info-tag').text()
      let types = $('.info-category').text()
      types=types.replace(/[0-9a-zA-Z;\r\n\s+]/g, "")
      let country = $('.info-source-duration').text()
      if (country.match(/(\S*)[0-9]/)){
        var runtime = country.match(/(\S*)[0-9]/)[0];
      }
      
      let index = country.lastIndexOf("/")
      country = country.slice(0,index).replace(/[\r\n\s+]/g, "");
      let releaseTime = $('.score-info').text()
      releaseTime = releaseTime.replace(/[\u4e00-\u9fa5]/g,"")
      var id =0
      if($('div .info-block').find('a').attr('href')){
        id = $('div .info-block').find('a').attr('href').match(/[1-9][0-9]*/g)[0];
      }
      let imgUrl = $('.info-poster').find('img').attr('src')
      let vote = $('.rating-num','.rating-stars').text()
      let box_array = $('.detail-num')
      let box_offic_all = box_array.eq(0).text()
      let box_offic_1d = box_array.eq(1).text()
      let box_offic_1w = box_array.eq(2).text()
      let box_offic_predict = box_array.eq(3).text()
      //获取今日日期
      var date = new Date();
      var seperator1 = "-";
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var strDate = date.getDate();
      if (month >= 1 && month <= 9) {
          month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
          strDate = "0" + strDate;
      }
      var currentdate = year + seperator1 + month + seperator1 + strDate;

  　　var sdate = new Date(releaseTime); 
  　　var now = new Date(currentdate);   
  　　var daysMinus = now.getTime() - sdate.getTime(); 
  　　var days = parseInt(daysMinus / (1000 * 60 * 60 * 24)); 


      getWord(id)
      //getUserImage(id)
      // var addParmas = [id,title,effect,types,country,releaseTime,runtime,imgUrl,vote,box_offic_all,box_offic_1d,box_offic_1w,box_offic_predict,days]
      
      // var addSql = "insert into maoyan(id,title,effect,types,country,releaseTime,runtime,imgUrl,vote,box_offic_all,box_offic_1d,box_offic_1w,box_offic_predict,days) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      // connection.query(addSql,addParmas,function(err,results,data){
      //   if(err){  
      //     console.log(err)
      //   }else{
      //     console.log('正在导入')
      //   }
      // })  
    })
  }
}

function getId(callback){
  request.get('https://piaofang.maoyan.com/rankings/year?year=2018')
  .set({ 'User-Agent': userAgents })
  .timeout({ response: 5000, deadline: 60000 })
  .end((err, res)=>{
    // 处理数据
    if (err) {
      console.log(`爬取页面失败，${err}`)
      return
    }
    var $ = cheerio.load(res.text, {decodeEntities: false});
    var req = $('#ranks-list').find('ul');
    req.each(function(){
      var maoyan_id=$(this).attr('data-com')
      var reg=/[0-9][0-9]*/g;
      maoyan_id = maoyan_id.match(reg)[0]
      idArray.push(maoyan_id)
    })
    callback()
  })
}
function getOtherId(callback){
  request.get('https://piaofang.maoyan.com/?ver=normal')
  .set({ 'User-Agent': userAgents })
  .timeout({ response: 5000, deadline: 60000 })
  .end((err, res)=>{
    // 处理数据
    if (err) {
      console.log(`爬取页面失败，${err}`)
      return
    }
    var $ = cheerio.load(res.text, {decodeEntities: false});
    var req = $('#ticket_tbody').find('ul');
    req.each(function(){
      var maoyan_id=$(this).attr('data-com')
      var reg=/[0-9][0-9]*/g;
      var days = $(this).find('em').html()
      if(reg.test(days)){
        maoyan_id = maoyan_id.match(reg)[0]
        days = $(this).find('em').html().match(reg)[0]
        if(days>2){
          idArray.push(maoyan_id)
        }
        
      }

    })
    callback()
  })

}
