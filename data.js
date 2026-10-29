export const houses = [
  {id:'sosna',name:'Сосна',type:'A-frame у леса',description:'Двухэтажный дом с панорамным окном, камином и собственной купелью. Для вечеров, которые не хочется заканчивать.',capacity:2,price:8900,x:68,y:23,initiallyOccupied:false,image:'assets/sosna-1.png',gallery:['assets/sosna-1.png','assets/sosna-2.png'],position:'center 48%'},
  {id:'tuman',name:'Туман',type:'Лесной A-frame',description:'Уютный дом среди заснеженных сосен с тёплой террасой и местом для вечернего костра.',capacity:3,price:11200,x:53,y:23,initiallyOccupied:false,image:'assets/tuman-1.png',gallery:['assets/tuman-1.png','assets/tuman-2.png'],position:'center'},
  {id:'hvoya',name:'Хвоя',type:'Лесной дом',description:'Мягкий свет, фактура дерева и тропинка среди высоких сосен. Пространство для неспешного отдыха вдвоём.',capacity:2,price:9600,x:83,y:23,initiallyOccupied:true,image:'assets/hvoya-1.png',gallery:['assets/hvoya-1.png','assets/hvoya-2.png'],position:'center'},
  {id:'bereg',name:'Берег',type:'Панорамный дом',description:'Тёплый дом с большим окном и камином. Здесь особенно приятно смотреть на зимний лес, не выходя из пледа.',capacity:4,price:15400,x:59,y:83,initiallyOccupied:false,image:'assets/bereg-1.png',gallery:['assets/bereg-1.png','assets/bereg-2.png'],position:'center'},
  {id:'kedr',name:'Кедр',type:'Семейный купол',description:'Просторный дом под куполом с видом на деревья и уютным местом для всей компании.',capacity:6,price:18900,x:69,y:60,initiallyOccupied:false,image:'assets/kedr-1.png',gallery:['assets/kedr-1.png','assets/kedr-2.png'],position:'center'},
  {id:'iskra',name:'Искра',type:'Панорамный дом',description:'Тихий дом среди деревьев с высоким окном, мягким светом и террасой для неспешных вечеров.',capacity:2,price:10400,x:85,y:60,initiallyOccupied:false,image:'assets/iskra-1.png',gallery:['assets/iskra-1.png','assets/iskra-2.png'],position:'center'},
  {id:'rosa',name:'Роса',type:'Стеклянный дом',description:'Светлый домик с окнами во всю стену. Просыпайтесь вместе с лесом и завтракайте на открытой террасе.',capacity:4,price:13700,x:53,y:60,initiallyOccupied:false,image:'assets/lake-glass.png',position:'center'},
  {id:'listva',name:'Листва',type:'Дом на склоне',description:'Домик над лесной тропой с видом на кроны деревьев. Для тех, кто ищет ощущение полного уединения.',capacity:4,price:12900,x:82,y:83,initiallyOccupied:true,image:'assets/forest-cabins.png',position:'74% 40%'}
];
export const mapPlaces = [
  {id:'lake',name:'Озеро',description:'Тихая вода и деревянный причал. Здесь особенно хорошо встречать утро.',x:23,y:25,symbol:'≈',images:['assets/lake-1.png','assets/lake-2.png']},
  {id:'reception',name:'Ресепшен',description:'Точка встречи перед прогулкой по территории. Здесь начинается ваше знакомство с Тихим берегом.',x:29,y:56,symbol:'⌂',images:['assets/reception-1.png']},
  {id:'pool',name:'Бассейн',description:'Место для неспешного отдыха у воды, когда хочется просто остановиться и выдохнуть.',x:14,y:70,symbol:'≈',images:['assets/pool-1.png']},
  {id:'firepit',name:'Костровая',description:'Вечерние разговоры у огня среди сосен и тёплый свет под открытым небом.',x:39,y:81,symbol:'✳',images:['assets/firepit-1.png']},
  {id:'cinema',name:'Кино под звёздами',description:'Гирлянды, большой экран и фильм под открытым небом.',x:29,y:90,symbol:'▷',images:['assets/open-air-cinema.png']}
];
export const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
