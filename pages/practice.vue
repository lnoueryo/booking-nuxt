<template>
    <div>
        <div>{{ hello }}</div>
        <div class="d-flex text-center">
            <div style="width: 100%;">
                <transition name="fade">
                    <div class="text-center d-flex">
                        <div>
                            <div style="border: 1px solid white">Date\Time</div>
                            <div v-for="(c, i) in calendar" :key="i">
                                <div v-if="days.length!=0">
                                    <div style="padding: 10px 0;height: 46px;border: 1px solid white">{{ days[i].getMonth()+1}}/{{ days[i].getDate() }} {{ dayOfWeek(days[i].getDay()) }}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="d-flex text-center">
                                <div style="border: 1px solid white;width:65px;" v-for="(period , i) in periods" :key="i"><span>{{ period }}</span></div>
                            </div>
                            <div v-for="(c, i) in calendar" :key="i" class="d-flex">
                                <div v-for="(time, j) in c" :key="j" style="border: 1px solid white">
                                    <div style="width:63px;padding: 10px 0;position: relative;" v-if="time.isBooking==true"><span style="height:25px;background-color: red;width:50%" @mouseenter="a(time.from)">&nbsp;&nbsp;</span></div>
                                    <div style="width:63px;padding: 10px 0" v-else><b>&nbsp;&nbsp;</b></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>
<script>
import axios from "axios";
import firebase from '@/plugins/firebase.js'
export default {
    props: ['duration', 'price', 'title'],
    data() {
        return {
            calendar: [],
            bookings: [],
            periods: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30','19:00'],
            days: this.makeTwoWeeks(0),
            dateIndex: 0,
            ready: false,
            helloText: '',
        }
    },
    computed: {
        hello() {
            return this.helloText.posts
        }
    },
    // watch: {
    //     duration: {
    //         handler(){
    //             this.makeCalendar(this.dateIndex);
    //         },
    //         immediate: true
    //     },
    // },
    created(){
        this.getBookings();
    },
    methods: {
        a(id){
            this.helloText = this.bookings.find((booking)=>{
                return booking.from.seconds === id.seconds;
            })
        },
        async getBookings(){
            const startDate = new Date();
            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);
            let endDate = new Date();
            endDate.setDate(endDate.getDate()+29);
            endDate.setHours(0);
            endDate.setMinutes(0);
            endDate.setSeconds(0);
            const db = firebase.firestore();
            await db.collection('bookings').orderBy('from', 'asc').startAt(startDate).endAt(endDate).get().then((querySnapshot) =>{
                querySnapshot.forEach((doc) => {
                    this.bookings.push(doc.data());
                });
            });
            await this.bookings.forEach((booking, i)=>{
                db.collection('plans').where('id', '==', booking.from.seconds).get().then((plans) =>{
                    let plan = plans.docs.map((plan) => {
                        return plan.data()
                    });
                    let a = Object.assign(booking, {posts: plan})
                    this.$set(this.bookings, i, a)
                });
            })
            await this.makeCalendar(0)
        },
        // getBookings(){
        //     const startDate = new Date();
        //     startDate.setHours(0);
        //     startDate.setMinutes(0);
        //     startDate.setSeconds(0);
        //     let endDate = new Date();
        //     endDate.setDate(endDate.getDate()+29);
        //     endDate.setHours(0);
        //     endDate.setMinutes(0);
        //     endDate.setSeconds(0);
        //     const db = firebase.firestore();
        //     db.collection('bookings').orderBy('from', 'asc').startAt(startDate).endAt(endDate).get().then(async (querySnapshot) =>{
        //         querySnapshot.forEach((doc) => {
        //             let bookings = [];
        //             db.collection(`bookings/${doc.id}/plan/`).get().then((plans)=>{
        //                 let planArray = [];
        //                 plans.forEach((plan)=> {
        //                     bookings.push(plan.data());
        //                 })
        //                 // let addedObject = Object.assign(doc.data(), {'plan': planArray})
        //                 // bookings.push(Object.assign(doc.data(), {'plan': planArray}));
        //             })
        //             // db.collection('users').doc(doc.data().uid).get().then((user)=>{
        //             //     console.log(user.data())
        //             // })
        //              this.bookings.push(doc.data());
        //         });
        //         this.makeCalendar(0)
        //     });
        // },
        makeCalendar(index){
            this.calendar = [];
            axios.head(window.location.href).then(response => {
                for (let i = 10*index; i < 10+10*index; i++) {
                    let dates = []
                    for (let j = 0; j < 19; j++) {
                        const today = new Date(response.headers.date)
                        today.setMonth(today.getMonth())
                        today.setDate(today.getDate()+i)
                        today.setHours(10)
                        today.setMinutes(30*j)
                        today.setSeconds(0)
                        dates.push({date: today, isBooking: false});
                    }
                    this.calendar.push(dates)
                }
            })
            .then(()=>{
                this.isBooking()
            })
            .then(()=>{
                this.bookableDate((this.duration/30)-1);
            })
            .catch((error)=>{
                console.log(error)
                this.ready = false;
            })
        },
        isBooking(){
            this.calendar.forEach((date, i) => {
                date.forEach((time, j) => {
                    this.bookings.forEach((booking)=>{
                        if (this.floor(booking.from.toDate())<=this.floor(time.date)&&this.floor(time.date)<this.floor(booking.to.toDate())) {
                            Object.assign(this.calendar[i][j],booking);
                            this.$set(this.calendar[i][j], 'isBooking', true);
                        }
                    })
                })
            })
        },
        bookableDate(index){
            this.calendar.forEach((date, i) => {
                date.forEach((time, j) => {
                    this.bookings.forEach(booking=>{
                        if (this.floor(booking.from.toDate())==this.floor(time.date)) {
                            for (let k = 1; k < index+1; k++) {
                                if((j-k)!==-1){
                                    this.$set(this.calendar[i][j-k], 'isBooking', true);
                                } else {
                                    return;
                                }
                            }
                        }
                    })
                })
            })
            this.calendar.forEach((date, i) => {
                date.forEach((time, j)=>{
                    if(index!==0 && (date.length-index)<=j){
                    this.$set(this.calendar[i][j], 'isBooking', true)
                }
                })
            })
            let that = this;
            setTimeout(function(){
                that.ready = false;
            },200)
        },
        floor(time){
            return Math.floor(time.getTime()/1000)
        },
        makeTwoWeeks(index){
            let daysArray = [];
            axios.head(window.location.href).then(response => {
                for (let i = 10*index; i < 10+10*index; i++) {
                    const days = new Date(response.headers.date);
                    days.setMonth(days.getMonth())
                    days.setDate(days.getDate()+i)
                    daysArray.push(days);
                }
            })
            return daysArray;
        },
        nextWeek(){
            this.ready = true;
            this.calendar = [];
            this.dateIndex+=1;
            this.days = this.makeTwoWeeks(this.dateIndex);
            this.makeCalendar(this.dateIndex)
        },
        previousWeek(){
            this.ready = true;
            this.calendar = [];
            this.dateIndex-=1;
            this.days = this.makeTwoWeeks(this.dateIndex);
            this.makeCalendar(this.dateIndex)
        },
        dayOfWeek(num){
            const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            return dayOfWeek[num]
        }
    }
}
</script>

