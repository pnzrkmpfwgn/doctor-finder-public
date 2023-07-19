// server.js
const express = require("express");
const bodyParser = require("body-parser");
const {initializeApp} = require("firebase/app");
const {getStorage,ref,getDownloadURL} = require("firebase/storage");
const {getFirestore,setDoc,doc,getDoc,collection} = require("firebase/firestore");
const {v4: uuidv4}  = require("uuid");



const fs = require("fs");
const puppeteer = require("puppeteer");

const resemble = require("resemblejs")

const next = require("next");

// Because of the complications between es5 and es6 I am not going to export this files from data folder I am simply going to copy them here
// not because I can't solve this or I am lazy it's just because I simply don't have any will power to do this anymore...
const expertiseData=[
  ["Ağız, Diş ve Çene Cerrahisi Uzmanı","Oral, Dental and Maxillofacial Surgeon Specialist"],
  ["Ağız, Diş ve Çene Radyolojisi Uzmanı","Oral, Dental and Maxillofacial Radiology Specialist"],
  ["Beyin ve Sinir Cerrahisi Uzmanı","Brain and Nerve Surgery Specialist"],
  ["Biyokimya ve Klinik Biyokimya Uzmanı","Biochemistry and Clinical Biochemistry Specialist"],
  ["Çocuk Cerrahisi Uzmanı","Pediatric Surgeon Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları Çocuk Endokrinoloji Uzmanı","Child Health and Diseases Pediatric Endocrinology Specialist"],
  ["Deri ve Zührevi Hastalıkları Uzmanı","Skin and Venereal Diseases Specialist"],
  ["Diş Hastalıkları ve Tedavisi Uzmanı","Dental Diseases and Treatment Specialist"],
  ["Diş Hekimi","Dentist"],
  ["Endodonti Uzmanı","Endodontics Specialist"],
  ["Enfeksiyon Hastalıkları Uzmanı","Infectious Diseases Specialist"],
  ["Fiziksel Tıp ve Rehabilitasyon Uzmanı","Physical Medicine and Rehabilitation Specialist"],
  ["Genel Cerrahi Uzmanı","General Surgery Specialist"],
  ["Göğüs Hastalıkları Uzmanı","Chest Diseases Specialist"],
  ["Göğüs Cerrahisi Uzmanı","Thoracic Surgery Specialist"],
  ["Göğüs Kalp ve Damar Cerrahisi Uzmanı","Thoracic and Cardiovascular Surgery Specialist"],
  ["Göz Sağlığı ve Hastalıkları Uzmanı", "Eye Health and Diseases Specialist"],
  ["İç Hastalıkları Endokrinoloji ve Metabolizma Hastalıkları Uzmanı","Internal Medicine, Endocrinology and Metabolic Diseases Specialist"],
  ["İç Hastalıkları Uzmanı","Internal Medicine Specialist"],
  ["İç Hastalıkları ve Hematoloji Uzmanı","Internal Medicine and Hematology Specialist"],
  ["İç Hastalıkları ve Gastroentoloji Uzmanı","Internal Medicine and Gastroentology Specialist"],
  ["İç Hastalıkları ve Geriatri Uzmanı","Internal Medicine and Geriatrics Specialist"],
  ["İç Hastalıkları ve Romatoloji Uzmanı","Internal Medicine and Rheumatology Specialist"],
  ["İç Hastalıkları Uzmanı ve Tıbbı Onkoloji Uzmanı","Internal Medicine Specialist and Medical Oncology Specialist"],
  ["Nöroloji Uzmanı","neurology expert"],
  ["Acil Tıp Uzmanı","Emergency Medicine Specialist"],
  ["Adli Tıp Uzmanı","Forensic Specialist"],
  ["Anestezi ve Reanimasyon Uzmanı","Anesthesia and Reanimation Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları Uzmanı & Çocuk Enfeksiyonu Uzmanı","Child Health and Diseases Specialist & Child Infection Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları Uzmanı & Çocuk Gastroentoloji Uzmanı","Child Health and Diseases Specialist & Pediatric Gastroenterology Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları Çocuk İmmünolojisi ve Alerji Uzmanı","Child Health and Diseases Child Immunology and Allergy Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları Uzmanı","Child Health and Diseases Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları ve Çocuk Kardiyolojisi Uzmanı","Child Health and Diseases and Pediatric Cardiology Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları ve Gelişimsel Pediatri Uzmanı","Child Health and Diseases and Developmental Pediatrics Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları ve Çocuk Nefroloji Uzmanları", "Child Health and Diseases and Pediatric Nephrology Specialists"],
  ["Child Health and Diseases and Child Neurology Specialist","Child Health and Diseases and Child Neurology Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları ve Çocuk Onkoloji Uzmanları","Child Health and Diseases and Pediatric Oncology Specialists"],
  ["Çocuk Sağlığı ve Hastalıkları ve Sosyal Pediatri Uzmanı","Child Health and Diseases and Social Pediatrics Specialist"],
  ["Çocuk Sağlığı ve Hastalıkları ve Yeni Doğan Uzmanı (Neonatoloji)","Child Health and Diseases and Newborn Specialist (Neonatology)"],
  ["Çocuk Sağlığı ve Hastalıkları ve Yeni Doğan Uzmanı","Child Health and Diseases and Newborn Specialist"],
  ["Kulak Burun Boğaz Hastalıkları Uzmanı","Ear Nose Throat Diseases Specialist"],
  ["Ortodonti Uzmanı","Orthodontist"],
  ["Ortopedi ve Travmatoloji Uzmanı","Orthopedics and Traumatology specialist"],
  ["Patoloji Uzmanı","Pathology Specialist"],
  ["Üroloji Uzmanı","Urology Specialist"],
  ["jinekoloji","gynecology"],
  ["Onkoloji Uzmanı","Oncology"], 

]

const keywords_tr={
  "Ağız, Diş ve Çene Cerrahisi Uzmanı":["diş çürümesi","dolgu","diş çekimi","kanal tedavisi"],
  "Ağız, Diş ve Çene Radyolojisi Uzmanı":["diş çürümesi","dolgu","diş çekimi","kanal tedavisi"],
  "Beyin ve Sinir Cerrahisi Uzmanı":["beyin tümörü","omurga hastalığı","beyin kanaması","inme"],
  "Biyokimya ve Klinik Biyokimya Uzmanı":["kan tahlil","idrar tahlil","tahlil"],
  "Çocuk Cerrahisi Uzmanı":["sindirim bozukluğu","solunum bozukluğu","travma","endoktrin","onkolojik"],
  "Çocuk Sağlığı ve Hastalıkları Çocuk Endokrinoloji Uzmanı":["obezite","tiroid","guatr","erken ergenlik","gecikmiş ergenlik","hipotroid"],
  "Deri ve Zührevi Hastalıkları Uzmanı":["deri","saç","tırnak","ağız","mukoza","cinsel yolla bulaşan hastalık"],
  "Diş Hastalıkları ve Tedavisi Uzmanı":["diş çürümesi","dolgu","diş çekimi","kanal tedavisi"],
  "Diş Hekimi":["diş çürümesi","dolgu","diş çekimi","kanal tedavisi"],
  "Endodonti Uzmanı":["diş çürümesi","dolgu","diş çekimi","kanal tedavisi"],
  "Enfeksiyon Hastalıkları Uzmanı":["bakteri","virus","mantar","parazit","cinsel yolla bulaşan hastalıklar"],
  "Fiziksel Tıp ve Rehabilitasyon Uzmanı":["ağrı","boyun","bel","sırt","diz","kronik","kas ağrısı"],
  "Genel Cerrahi Uzmanı":["tiroid","apandisit","meme ağrısı","meme sertliği","basur","kıl dönmesi","ince ve kalın bağırsak"],
  "Göğüs Hastalıkları Uzmanı":["bronşit","bronşiolit","trakeit","zatüre","astım","tüberküloz","covid-19"],
  "Göğüs Cerrahisi Uzmanı":["bronşit","bronşiolit","trakeit","zatüre","astım","tüberküloz","covid-19"],
  "Göğüs Kalp ve Damar Cerrahisi Uzmanı":["bronşit","bronşiolit","trakeit","zatüre","astım","tüberküloz","covid-19","kalp","damar"],
  "Göz Sağlığı ve Hastalıkları Uzmanı":["göz","katarakt","retina"],
  "İç Hastalıkları Endokrinoloji ve Metabolizma Hastalıkları Uzmanı":["diyabet","şeker","obezite","hipertansiyon"],
  "İç Hastalıkları Uzmanı":["üst solunum","alt solunum","enfeksiyon","tiroid","akciğer","kolestrol","karaciğer","mide","safra kesesi"],
  "İç Hastalıkları ve Hematoloji Uzmanı":["üst solunum","alt solunum","enfeksiyon","tiroid","akciğer","kolestrol","karaciğer","mide","safra kesesi"],
  "İç Hastalıkları ve Gastroentoloji Uzmanı":["üst solunum","alt solunum","enfeksiyon","tiroid","akciğer","kolestrol","karaciğer","mide","safra kesesi"],
  "İç Hastalıkları ve Geriatri Uzmanı":["üst solunum","alt solunum","enfeksiyon","tiroid","akciğer","kolestrol","karaciğer","mide","safra kesesi"],
  "İç Hastalıkları ve Romatoloji Uzmanı":["üst solunum","alt solunum","enfeksiyon","tiroid","akciğer","kolestrol","karaciğer","mide","safra kesesi"],
  "İç Hastalıkları Uzmanı ve Tıbbı Onkoloji Uzmanı":["kadın hastalıkları"],
  "Nöroloji Uzmanı":["beyin","sinir"],
  "Acil Tıp Uzmanı":[""],
  "Adli Tıp Uzmanı":[""],
  "Anestezi ve Reanimasyon Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları Uzmanı & Çocuk Enfeksiyonu Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları Uzmanı & Çocuk Gastroentoloji Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları Çocuk İmmünolojisi ve Alerji Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Çocuk Kardiyolojisi Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Gelişimsel Pediatri Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Çocuk Nefroloji Uzmanları":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Çocuk Nörolojisi Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Çocuk Onkoloji Uzmanları":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Sosyal Pediatri Uzmanı":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Yeni Doğan Uzmanı (Neonatoloji)":[""],
  "Çocuk Sağlığı ve Hastalıkları ve Yeni Doğan Uzmanı":[""],
  "Kulak Burun Boğaz Hastalıkları Uzmanı":[""],
  "Ortodonti Uzmanı":[""],
  "Ortopedi ve Travmatoloji Uzmanı":[""],
  "Patoloji Uzmanı":[""],
  "Üroloji Uzmanı":[""],
  "jinekoloji":[""],
  "Onkoloji Uzmanı":[""]
}

const keywords_en={
  "Oral, Dental and Maxillofacial Surgeon Specialist":["tooth decay","filling","tooth extraction","root canal treatment"],
  "Oral, Dental and Maxillofacial Radiology Specialist":["tooth decay","filling","tooth extraction","root canal treatment"],
  "Brain and Nerve Surgery Specialist":["brain tumor","spine disease","aneurysm","stroke"],
  "Biochemistry and Clinical Biochemistry Specialist":["blood analysis","urine test","analysis"],
  "Pediatric Surgeon Specialist":["digestion disorder","respiratory disorder","trauma","endocrine","oncology"],
  "Child Health and Diseases Pediatric Endocrinology Specialist":["obesity","thyroid","goiter","early adolescence","late adolescence","hypothyroid"],
  "Skin and Venereal Diseases Specialist":["skin","hair","nail","mucosa","sexually transmitted disease"],
  "Dental Diseases and Treatment Specialist":["tooth decay","filling","tooth extraction","root canal treatment"],
  "Dentist":["tooth decay","filling","tooth extraction","root canal treatment"],
  "Endodontics Specialist":["tooth decay","filling","tooth extraction","root canal treatment"],
  "Infectious Diseases Specialist":["bacteria","virus","fungal","parasite","sexually transmitted disease"],
  "Physical Medicine and Rehabilitation Specialist":["chronic","pain","neck","waist","back","knee","muscle pain"],
  "General Surgery Specialist":["thyroid","appendicitis","breast pain","breast firmness","hemorrhoids","ingrown hair","small and large intestine"],
  "Chest Diseases Specialist":["bronchitis","bronchiolitis","tracheitis","pneumonia","asthma","tuberculosis","covid-19"],
  "Thoracic Surgery Specialist":["bronchitis","bronchiolitis","tracheitis","pneumonia","asthma","tuberculosis","covid-19"],
  "Thoracic and Cardiovascular Surgery Specialist":["bronchitis","bronchiolitis","tracheitis","pneumonia","asthma","tuberculosis","covid-19","heart","veins"],
  "Eye Health and Diseases Specialist":["eye","cataract","retina"],
  "Internal Medicine, Endocrinology and Metabolic Diseases Specialist":["diabetes","obesity","hypertension"],
  "Internal Medicine Specialist":["upper respiratory","lower respiratory","infection","thyroid","lung","liver","cholesterol","stomach","gall bladder"],
  "Internal Medicine and Hematology Specialist":["upper respiratory","lower respiratory","infection","thyroid","lung","liver","cholesterol","stomach","gall bladder"],
  "Internal Medicine and Gastroentology Specialist":["upper respiratory","lower respiratory","infection","thyroid","lung","liver","cholesterol","stomach","gall bladder"],
  "Internal Medicine and Geriatrics Specialist":["upper respiratory","lower respiratory","infection","thyroid","lung","liver","cholesterol","stomach","gall bladder"],
  "Internal Medicine and Rheumatology Specialist":["upper respiratory","lower respiratory","infection","thyroid","lung","liver","cholesterol","stomach","gall bladder"],
  "Internal Medicine Specialist and Medical Oncology Specialist":[""],
  "Neurology expert":["brain"],
  "Emergency Medicine Specialist":[""],
  "Forensic Specialist":[""],
  "Anesthesia and Reanimation Specialist":[""],
  "Child Health and Diseases Specialist & Child Infection Specialist":[""],
  "Child Health and Diseases Specialist & Pediatric Gastroenterology Specialist":[""],
  "Child Health and Diseases Specialist":[""],
  "Child Health and Diseases Child Immunology and Allergy Specialist":[""],
  "Child Health and Diseases and Pediatric Cardiology Specialist":[""],
  "Child Health and Diseases and Developmental Pediatrics Specialist":[""],
  "Child Health and Diseases and Pediatric Nephrology Specialists":[""],
  "Child Health and Diseases and Child Neurology Specialist":[""],
  "Child Health and Diseases and Pediatric Oncology Specialists":[""],
  "Child Health and Diseases and Social Pediatrics Specialist":[""],
  "Child Health and Diseases and Newborn Specialist (Neonatology)":[""],
  "Child Health and Diseases and Newborn Specialist":[""],
  "Ear Nose Throat Diseases Specialist":[""],
  "Orthodontist":[""],
  "Orthopedics and Traumatology specialist":[""],
  "Pathology Specialist":[""],
  "Urology Specialist":[""],
  "gynecologist":[""],
  "Oncology":[""]
}

const insuranceArr = [
  "Devlet Sigortası",
  "Axia",
  "Allianz",
  "Anadolu Sigorta",
  "Garanti Emeklilik ve Hayat",
  "Ziraat Hayat ve Emeklilik ",
  "Fiba Emeklilik ve Hayat",
];

const nationalityArr  = [
  "T.C. Kimlik",
   "K.K.T.C. Kimlik",
  "British ID Card"
];

const genderArr = [
    "Erkek","Kadın"
];

const title_tr_arr = [
  "Pratisyen Hekim",
  "Uzman Dr.",
  "Operatör Dr.",
  "Yardımcı Doçent Dr.",
  "Doçent Dr.",
  "Profesör Dr."
]

const title_en_arr = [
  "General Practitioner",
  "Specialist",
  "Operator Dr.",
  "Assistant Professor Dr.",
  "Associate Professor Dr.",
  "Professor Dr."
]

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


const generateRandomSchedule =(city,doctorId)=>{
  let randomScheduleIdArr = [];
  for(let i = 0 ;i < 20 ; i++){
    randomScheduleIdArr.push(uuidv4());
  }
  
  let schedule = []

  for(let i = 0 ; i < 20;i++){
    let randomInsuranceIndex;
    
    let randomLocation;
    let randomMonth=Math.floor(Math.random() * 2) + 6;
    let randomDay;
    let availabilitiyArr =[["available","#3788d8"],["cancelled","red"],["booked","#878a88"]]; 
    if(randomMonth === 6){
      randomDay = Math.floor(Math.random() * 7) + 24;
      randomInsuranceIndex = Math.floor(Math.random() * 7);
      let randomTime = Math.floor(Math.random() * 8) + 10;
      let lat =35 + Math.random() * (0.9 - 0.0001) + 0.0001;
      let lng = 33 + Math.random() * 0.9 + 1;
      let randomAvailabilityIndex = Math.floor(Math.random() * 2);
      randomLocation = {
        lat:lat,
        lng:lng
      }
      const item = {
        city:city,
        doctorId:doctorId,
        id:randomScheduleIdArr[i],
        insurance:insuranceArr[randomInsuranceIndex],
        location:randomLocation,
        color:availabilitiyArr[randomAvailabilityIndex][1],
        patientId:"",
        patientName:"",
        patientPhone:"",
        start:`2023-06-${randomDay}T${randomTime}:00:00`,
        end:`2023-06-${randomDay}T${++randomTime}:00:00`,
        status:availabilitiyArr[randomAvailabilityIndex][0],
        title:"Appointment",
      }
      schedule.push(item);

    }else if(randomMonth === 7){
      randomDay = Math.floor(Math.random() * 7);;
      randomInsuranceIndex = Math.floor(Math.random() * 7);
      let randomTime = Math.floor(Math.random() * 8) + 10;
      let lat =35 + Math.random() * (0.9 - 0.0001) + 0.0001;
      let lng = 33 + Math.random() * 0.9 + 1;
      let randomAvailabilityIndex = Math.floor(Math.random() * 2);
      randomLocation = {
        lat:lat,
        lng:lng
      }
      const item = {
        city:city,
        doctorId:doctorId,
        id:randomScheduleIdArr[i],
        insurance:insuranceArr[randomInsuranceIndex],
        location:randomLocation,
        patientId:"",
        patientName:"",
        patientPhone:"",
        start:`2023-07-${randomDay}T${randomTime}:00:00`,
        end:`2023-07-${randomDay}T${++randomTime}:00:00`,
        status:availabilitiyArr[randomAvailabilityIndex],
        title:"Appointment",
      }
      schedule.push(item);

    }
   
  }
  return schedule;
}

const generateRandomTestimonial = (doctorId) => {
  const randomAnonimity = Math.random() < 0.5;
  const randomTestimonialId = uuidv4();

  const randomNames = [{
    name:"Johnny",
    surname:"Turbo"
  },
  {
    name:"Adam",
    surname:"Jensen"
  },
  {
    name:"İlber",
    surname:"Ortaylı"
  },
  {
    name:"Raskolnikov",
    surname:"Radimin"
  },
  {
    name:"Paul",
    surname:"Denton"
  },
  {
    name:"Weyland",
    surname:"Yutani"
  },
  {
    name:"David",
    surname:"Sarif"
  },
  {
    name:"Aldous",
    surname:"Huxley"
  },
  {
    name:"Mihaylovic",
    surname:"Dostoyevsky"
  },
  {
    name:"Hover Philips",
    surname:"Lovecraft"
  },
  {
    name:"Mehmet",
    surname:"Şimşek"
  },
  {
    name:"Yılmaz",
    surname:"Özdil"
  },
  {
    name:"Turgut",
    surname:"Özakman"
  },
  {
    name:"Dimitri",
    surname:"Karamazov"
  },
  {
    name:"Gabriel Garcia",
    surname:"Marquez"
  }
]

  const randomTestimonialContent = [{
    text:"This doctor is really good, he revived me, pulled me from the reaper's hands!",
    rating:5
  },
  {
    text:"Bu doktor çok cahil.",
    rating:1
  }, 
  {
    text:"Yani anlamadım, doktora girdik bize hasta olduğunu söyledi. Beynindeki tümörün filmini gösterdi anlamadık biz mi seni tedavi etmeye geldik?",
    rating:2
  },
  {
    text:"I never asked for this!",
    rating:3
  },
  {
    text:"This doctor is bad. Simple",
    rating:1
  },
  {
    text:"Saolsunlar çok iyi ilgilendiler. Hemen teşhisi koyup hallettiler şimdiden iyileşmiş hissediyorum.",
    rating:5
  },
  {
    text:"Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
    rating:4
  },
  {
    text:"Bundan randevu almayın gelmiyor kendisi ya da iptal ediyor!",
    rating:2
  },
  {
    text:"Some say concentrated power leads to abuse, but I believe that if an institution has a solid foundation it can survive the narrow aspirations of the people it employs.",
    rating:4
  },
  {
    text:"There's a time and a place for security, but the legislature has to stay vigilant, or there will be abuses.",
    rating:5
  },
  {
    text:"The wealthy have always been the ones to profit from one-world government.",
    rating:1
  },

]

  let testimonials=[];
  

  for(let i = 0 ; i < 5 ; i++){
    const randomNameIndex = Math.floor(Math.random() * 14);
  const randomContentIndex = Math.floor(Math.random() * 11);
  
  const item = {
    created_at:"16-06-2023",
    from:"",
    isAnonymous:randomAnonimity,
    name:randomNames[randomNameIndex]["name"],
    rating:randomTestimonialContent[randomContentIndex]["rating"],
    surname:randomNames[randomNameIndex]["surname"],
    testimonial_text:randomTestimonialContent[randomContentIndex]["text"],
    testimonial_id:randomTestimonialId,
    to:doctorId
  }
  testimonials.push(item)
  }
  return testimonials
}


const dev = process.env.NODE_ENV !== 'production'

const app = next({dev})
const server = express()
const jsonParser = bodyParser.json()
const handle = app.getRequestHandler()


app.prepare().then(()=>{
  const firebaseConfig = initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
  })
  const storage = getStorage(firebaseConfig);
  const db = getFirestore(firebaseConfig);



  
  
  // (async ()=>{
  //   // Generate test SMTP service account from ethereal.email
  // // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: testAccount.user, // generated ethereal user
  //     pass: testAccount.pass, // generated ethereal password
  //   },
  // });

  // // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
  //   to: "bar@example.com, baz@example.com", // list of receivers
  //   subject: "Hello ✔", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // });

  // console.log("Message sent: %s", info.messageId);
  // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  // })();
  
   
  server.post("/api/compare-id-images",jsonParser,(req,res)=>{
    const idRef = ref(storage,`IdImages/${req.body.uid}`)
    let exampleIdRef;
    switch (req.body.nationality) {
      case "tc":
        exampleIdRef = ref(storage,`TR_ID/exampleId.jpg`)   
        break;
      case "kktc":
        exampleIdRef = ref(storage,`KKTC_ID/kktc_id.jpg`);
        break;
      case "uk":
        exampleIdRef = ref(storage,`UK_ID/UK_ID.jpg`);
        break;
      default:
        break;
    }

    getDownloadURL(exampleIdRef).then(url => {
      let img1 =url;
      getDownloadURL(idRef).then(url => {
        let img2=url
        var diff = resemble(img1)
            .compareTo(img2).scaleToSameSize()
            .ignoreColors().ignoreAntialiasing()
            .onComplete(function (data) {
              console.log(data)
              res.send(data);
            });
      
      })
    })
  })

  server.post("/api/compare-person-images",jsonParser,(req,res)=>{
    const idRef = ref(storage,`IdImages/${req.body.uid}`)
    let personIdRef = ref(storage,`PersonImages/${req.body.uid}`);

    getDownloadURL(personIdRef).then(url => {
      let img1 =url;
      getDownloadURL(idRef).then(url => {
        let img2=url
        var diff = resemble(img1)
            .compareTo(img2).scaleToSameSize()
            .ignoreColors().ignoreAntialiasing()
            .onComplete(function (data) {
              console.log(data)
              res.send(data);
            });
      
      })
    })
  })

  server.get("/deneme",(req,res)=>{
    res.send("OK")
  })

  server.get("*",(req,res)=>{
    return handle(req,res)
  })
  server.listen(3000, err=>{
    if(err) throw err
    console.log("server ready!")
  })

  
// Web Scraping

//puppeteer session start
const getDoctors = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  //yeni sayfa aç
  const sayfa = await browser.newPage();

  // şu https://neareasthospital.com/doctors/?lang=en sayfayı aç
  await sayfa.goto("https://neareasthospital.com/doctors/?lang=en", {
    waitUntil: "domcontentloaded",
  });

  const docCont = await sayfa.evaluate(async () => {
    const docName = document.querySelectorAll(".card-staff__content");
    // şu arraya async yazma anasını sikiyor
    return Array.from(docName).map((kimlik) => {
      const isim = kimlik.querySelector(".card-staff__title").innerText.replace(/\n/g, "");
      const brans = kimlik.querySelector(".card-staff__duty").innerText.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "");
      const numara = kimlik.querySelector('.list.is-unstyled.is-horizontal.card-staff__list a').getAttribute('href');
      return {isim,brans,numara};
    });
  });
 
  const data = docCont.map((item) => `${item.isim} - ${item.brans} - ${item.numara}`).join("\n");
  fs.writeFileSync("DoctorsNearEast.txt", data);
  console.log("Data written to file for NearEast");

  // Click on the "Next page" button
  // await page.click(".pager > .next > a")

  await browser.close();
};


//puppeteer session start
const getDoctors2 = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  //yeni sayfa aç
  const sayfa = await browser.newPage();

  // şu https://cypruscentralhospital.com/doktorlarimiz/ sayfayı aç
  await sayfa.goto("https://cypruscentralhospital.com/doktorlarimiz/", {
    waitUntil: "domcontentloaded",
  });
  

  const docCont = await sayfa.evaluate(async () => {
    const docName = document.querySelectorAll(".mkdf-team-info");
    // şu arraya async yazma anasını sikiyor
    return Array.from(docName).map((kimlik) => {
      const isim = kimlik.querySelector(".mkdf-team-name.entry-title").innerText.replace(/\n/g, "");
      const brans = kimlik.querySelector(".mkdf-team-position").innerText.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "");
      const numara = "+90 (392) 366 50 85 "
      const email = "info@cypruscentralhospital.com"
      return {isim,brans,numara,email};
    });
  });
 
  const data = docCont.map((item) => `${item.isim} - ${item.brans} - ${item.numara} - ${item.email}`).join("\n");
  fs.writeFileSync("DoctorsCyprusCentral.txt", data);
  console.log("Data written to file for CentralHospital");

  await browser.close();
};

//puppeteer session start
// const getDoctors3 = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//   });

//   const data = [];

//   try {
//     const sayfa = await browser.newPage();

//     await sayfa.goto("https://www.kttb.org/doktorlarimiz/", {
//       waitUntil: "domcontentloaded",
//     });

//     let hasNextPage = true;
//     while (hasNextPage) {
//       const docCont = await sayfa.evaluate(() => {
//         const docName = document.querySelectorAll(".tablepress-31 > tbody > tr");
//         return Array.from(docName).map((kimlik) => {
//           const isim = kimlik.querySelector(".column-1")?.innerText?.replace(/\n/g, "") || "info is not specified";
//           const brans = kimlik.querySelector(".column-2")?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
//           const numara = kimlik.querySelector(".column-3")?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
//           const bölge = kimlik.querySelector(".column-4")?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
//           return {isim, brans, numara, bölge};
//         });
//       });

//       data.push(...docCont);

//       const nextPage = await sayfa.$(".tablepress-31_paginate > .tablepress-31_next");
//       if (nextPage !== null) {
//         await nextPage.click();
//         await sayfa.waitForNavigation();
//       } else {
//         hasNextPage = false;
//       }
//     }

//     const dataStr = data.map((item) => `${item.isim} - ${item.brans} - ${item.numara} - ${item.bölge}`).join("\n");
//     fs.writeFileSync("DoctorsAll.txt", dataStr);
//     console.log("Data written to file for All Cyprus");
//     } catch (error) {
//     console.error(error);
//     } finally {
//     await browser.close();
//     }
// };



const getDoctors4 = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

    const sayfa = await browser.newPage();

    await sayfa.goto("https://www.kttb.org/doktorlarimiz/", {
      waitUntil: "domcontentloaded",
    });
   
    let docCont = [];

    while (true) {
      const doctors = await sayfa.evaluate(() => {
        const rows = Array.from(document.querySelectorAll(".row-hover > tr"));
  
        return rows.map((row) => {
          const columns = row.querySelectorAll("td");
          const isim = columns[0]?.innerText?.replace(/\n/g, "") || "info is not specified";
          const numara = columns[1]?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
          const brans = columns[2]?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
          const bölge = columns[3]?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
          return { isim, brans, numara, bölge };
        });
      });
  
      docCont = [...docCont, ...doctors];      
  
      const nextPageBtn = await sayfa.$(".paginate_button.next");
      const isDisabled = await nextPageBtn.evaluate((btn) => btn.classList.contains("disabled"));
  
      if (isDisabled) break;
  
      await nextPageBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }
    let newArr = []
      
    for(var i = 0 ; i < docCont.length ; i++){
       if(!docCont[i]["isim"].includes("info is not specified") && !docCont[i]["brans"].includes("info is not specified") && !docCont[i]["numara"].includes("info is not specified") && !docCont[i]["bölge"].includes("info is not specified") ){
        newArr.push(docCont[i])
       }
    }
   
    // for (var i = 0 ; i < expertiseData.length ; i++){
    //     for(var j = 0 ; j < 5 ; j++){
    //       if(expertiseData[i][0] === docCont[i]["brans"]){
    //         const id = uuidv4();
    //         const docRef = doc(db,"Doctors_scrapped",id);

    //         (async ()=>{
    //           await setDoc(docRef)
    //         })();
    //       }
    //     }
    // }
    let test_arr = []
    for (var i = 0 ; i < newArr.length ; i++){
        for(var j = 0 ; j < expertiseData.length ; j++){
          if(newArr[i]["brans"] === expertiseData[j][0]){ 
            const randomTitleIndex = Math.floor(Math.random() * 6);
            const randomNationalityIndex = Math.floor(Math.random() * 2);
            const randomCardId = Math.floor(Math.random() * 900000000) + 100000000;
            const randomGenderIndex = Math.random();
            const randomPhoneNumber = Math.floor(Math.random() * 900000000) + 100000000;
            const randomMedicalLicense = Math.floor(Math.random() * 900000000) + 100000000;
            const  randomInsuranceIndex = Math.floor(Math.random() * 7);
            const randomRating = Math.floor(Math.random() * 5) + 1;
            const id = uuidv4();
            let lat =35 + Math.random() * (0.9 - 0.0001) + 0.0001;
            let lng = 33 + Math.random() * 0.9 + 1;
            let randomLocation = [{
              lat:lat,
              lng:lng
            }]
            let name = "";
            let surname = "";
            let name_component_length = 0;
            let name_surname_arr = []
            if(!(newArr[i]["isim"].split(" ").length < 2)){
             name_component_length = newArr[i]["isim"].split(" ").length;
             name_surname_arr = newArr[i]["isim"].split(" ");
            
              let index = 1;
              if(name_surname_arr[index].length > 3){
                for(let item = index ; item < (name_component_length-1);++item){
                  name += name_surname_arr[item];
                }
                surname = name_surname_arr[name_component_length - 1]
              }else if (name_surname_arr[index].length < 3){
                ++index;
                for(let item = index ; item < (name_component_length-1);++item){
                  name += name_surname_arr[item];
                }
                surname = name_surname_arr[name_component_length - 1]
              }
            }
              const testimonials = generateRandomTestimonial(id);
              const schedule = generateRandomSchedule(newArr[i]["bölge"],id)
            
            const data = {
              card_id:randomCardId,
              id :id,
              city:newArr[i]["bölge"],
              expertise_en:expertiseData[j][1],
              expertise_tr:expertiseData[j][0],
              title_en:title_en_arr[randomTitleIndex],
              title_tr:title_tr_arr[randomTitleIndex],
              gender:genderArr[randomGenderIndex],
              insurance:insuranceArr[randomInsuranceIndex],
              testimonials:testimonials,
              schedule:schedule,
              role:"doctor",
              registered:true,
              rating:randomRating,
              nationality:nationalityArr[randomNationalityIndex],
              name:name,
              surname:surname,
              phone_number:randomPhoneNumber,
              medical_lisence_id:randomMedicalLicense,
              keywords_en:keywords_en[expertiseData[j][1]],
              keywords_tr:keywords_tr[expertiseData[j][0]],
              locations:randomLocation,
              verified:false,
            }
            test_arr.push(data)
          }
        }
      
    }
    let new_arr = [];
  for (let i = 0; i < expertiseData.length; i++) {
    const field = expertiseData[i][0];

    // Filter the original array to get the objects that have the current field
    const matchingObjects = test_arr.filter(obj => obj.expertise_tr === field);

    // Take up to 5 objects (or fewer if there are fewer than 5) and add them to the new array
    new_arr.push(...matchingObjects.slice(0, 5));
  }

  for (let i = 0; i < new_arr.length; i++) {
    const data = {
      // Ensure all fields have valid values
      card_id: new_arr[i].card_id || "",
      id: new_arr[i].id || "",
      city: new_arr[i].city || "",
      expertise_en: new_arr[i].expertise_en || "",
      expertise_tr: new_arr[i].expertise_tr || "",
      title_en: new_arr[i].title_en || "",
      title_tr: new_arr[i].title_tr || "",
      gender: new_arr[i].gender || "",
      insurance: new_arr[i].insurance || "",
      testimonials: new_arr[i].testimonials || [],
      schedule: new_arr[i].schedule || [],
      role: new_arr[i].role || "",
      registered: new_arr[i].registered || false,
      rating: new_arr[i].rating || 0,
      nationality: new_arr[i].nationality || "",
      name: new_arr[i].name || "",
      surname: new_arr[i].surname || "",
      phone_number: new_arr[i].phone_number || "",
      medical_lisence_id: new_arr[i].medical_lisence_id || "",
      keywords_en: new_arr[i].keywords_en || [],
      keywords_tr: new_arr[i].keywords_tr || [],
      locations: new_arr[i].locations || [],
      verified: new_arr[i].verified || false,
    };

    try {
      await setDoc(doc(db, "Doctors", new_arr[i].id), data);
      await sleep(200);
    } catch (error) {
      console.error("Error setting document:", error);
    }
  }


      const data = newArr.map((item) => `${item.name} + ${item.expertise_tr}`).join("\n");
      fs.writeFileSync("DoctorsDeneme.txt", data);

        // console.log(docCont);

        await browser.close();
};

// getDoctors();
// getDoctors2();
// getDoctors3();
// getDoctors4();

// fs.readFile('DoctorsDeneme.txt', 'utf8', function(err, data){
      
//   // Display the file content

//   let newData = JSON.parse(data);
  
//   console.log( newData);
// });

// cron.schedule('0 0 */5 * *', () => {
//   getDoctors4();
// }, {
//   scheduled: true,
//   timezone: 'GMT+3', 
//   stopOnInit: true,
// });

}).catch(err=>{
  console.error(err)
})
