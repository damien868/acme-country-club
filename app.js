const Sequelize=require('sequelize')
const express=require('express')
const {DataTypes}=Sequelize
const db=new Sequelize("postgres://localhost/acme_country_club")
const app=express();

app.get('/api/facilities',async(req,res,next)=>{
    try{
        res.send(await Facility.findAll({
            include:[Booking]
        }))
    }
    catch(err){
        next(err)
    }
})
app.get('/api/bookings',async(req,res,next)=>{
    try{
        res.send(await Booking.findAll({
            include:[Facility,Member]
        }))
    }
    catch(err){
        next(err)
    }
})

const Facility=db.define('facility',{
    name:{type:DataTypes.STRING(100),unique:true,notNull:true},
    id:{type:DataTypes.UUID,primaryKey:true,defaultValue:DataTypes.UUIDV4}
})

const Member=db.define('member',{
    id:{type:DataTypes.UUID,primaryKey:true,defaultValue:DataTypes.UUIDV4},
    first_name:{type:DataTypes.STRING(20),unique:true,notNull:true}
})

const Booking=db.define('booking',{
    id:{type:DataTypes.INTEGER,primaryKey:true},
    startTime:{notNull:true,type:DataTypes.DATE},
    endTime:{notNull:true,type:DataTypes.DATE},
})

const syncAndSeed=async()=>{
    try{
    await db.sync({force:true})
    const pool=await Facility.create({name:'pool'}) //refactor this and next two lines with Promise.All()
    const lucy=await Member.create({first_name:'lucy'})
    const curly=await Member.create({first_name:'curly'})
    const reservation1=await Booking.create({id:1,startTime:1030,endTime:1130});
    reservation1.facilityId=pool.id //modifying object, no await needed
    reservation1.memberId=lucy.id
    await reservation1.save() //the actual write
    lucy.sponsorId=curly.id
    await lucy.save();
    }
    catch(err){
        console.log(err)
    }
}

const init=async()=>{
    try{
    await db.authenticate();
    await syncAndSeed();
    const PORT=process.env.PORT||3000;
    app.listen(PORT,()=>{console.log(`listening to PORT ${PORT}`)})
    }
    catch(err){
        console.log(err)
    }
}
init();
Booking.belongsTo(Facility)
Booking.belongsTo(Member)
Member.belongsTo(Member,{as:'sponsor'})
Facility.hasMany(Booking)




