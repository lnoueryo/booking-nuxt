<template>
  <div>
    <v-btn @click="login">Login</v-btn>
    <v-btn @click="logout">Logout</v-btn>
    <calendar></calendar>
  </div>
</template>
<script>
import firebase from '@/plugins/firebase'
import Calendar from '/components/Calendar'
export default {
  components: {
    Calendar
  },
  created(){
    const db = firebase.firestore();
    var bookings = db.collection('bookings');
    bookings.get().then((response)=>{
        response.forEach(function(booking) {
            // this.bookings.push(booking.data());
            console.log(booking.data())
        });
    })
  },
  methods: {
    login(){
      this.$store.dispatch('login', {email: 'popo62520908@gmail.com', password: '123456789'})
    },
    logout(){
      this.$store.dispatch('logout')
    }
  }
}
</script>