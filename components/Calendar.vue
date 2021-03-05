<template>
    <div>
        <div class="d-flex text-center" style="max-width:680px;margin: auto;align-items: center">
            <div>
                <v-btn @click="previousWeek" :disabled="ready || dateIndex==0">Back</v-btn>
            </div>
                <div class="px-3" style="max-width: 540px; width: 100%;overflow-x:scroll;">
                    <transition name="fade">
                        <div class="d-flex text-center justify-content-start">
                            <div>
                                <div style="display: inline-block;height: 45px">&nbsp;&nbsp;</div>
                                <div class="p-1" style="height: 31px" v-for="(period , i) in periods" :key="i"><span>{{ period }}</span></div>
                            </div>
                            <div class="d-flex" style="margin: auto" v-if="calendar.length!=0">
                                <div v-for="(c, i) in calendar" :key="i">
                                    <div style="width: 45px;height: 45px" v-if="days.length!=0">
                                        <div>{{ days[i].getMonth()+1}}/{{ days[i].getDate() }}</div>
                                        <div>{{ dayOfWeek(days[i].getDay()) }}</div>
                                    </div>
                                    <div style="height: 31px" class="p-1" v-for="(time, j) in c" :key="j">
                                        <router-link style="text-decoration: none;" to="/">
                                            <b>{{ (time.isBooking==false) ? '〇' : '×' }}</b>
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            <div>
                <v-btn @click="nextWeek" :disabled="ready || dateIndex==2">Next</v-btn>
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
        db.collection('bookings').orderBy('from', 'asc').startAt(startDate).endAt(endDate).get().then((querySnapshot) =>{
            querySnapshot.forEach(async(doc) => {
                this.bookings.push(doc.data());
            });
            this.makeCalendar(0)
        });
    },
    methods: {
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
                this.getBookings()
            })
            .then(()=>{
                this.bookableDate((this.duration/30)-1);
            })
            .catch((error)=>{
                console.log(error)
                this.ready = false;
            })
        },
        getBookings(){
            this.calendar.forEach((date, i) => {
                date.forEach((time, j) => {
                    this.bookings.forEach(booking=>{
                        if (this.floor(booking.from.toDate())<=this.floor(time.date)&&this.floor(time.date)<this.floor(booking.to.toDate())) {
                            this.$set(this.calendar[i][j], 'isBooking', true)
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

<style scoped>
    .is-disabled {
        pointer-events: none;
        opacity: .5;
        color: red;
        font-weight: bold;
    }
    .fade-enter-active, .fade-leave-active {
        will-change: opacity;
        transition: opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        opacity: 1;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0
    }
</style>
