;(function(){
  'use strict'

  var Event = new Vue();

  var alert_sound = document.getElementById('alert-sound')

  function copy(obj){
    return Object.assign({},obj);
  }

  Vue.component('task',{
    template:'#task-tpl',
    props:['todo'],
    methods:{
      action: function(name, params){
        Event.$emit(name,params)
      }
    }
  })

  new Vue({
    el: '#main',
    data: {
      //整个应用的数据仓库
      list: [],
      last_id: 0,
      //当前行
      current:{
        // title: '...',
        // completed: false,
        // desc: '...',
        // remind_at: '2020-10-1'
      }
    },

    mounted: function(){
      var me = this
      this.list = ms.get('list') || this.list
      this.last_id = ms.get('last_id') || this.last_id

      //alert_at如何获取日期
      setInterval(function(){
        me.check_alerts()
      },3000)

      Event.$on('remove',function(id){
        // console.log('params:',params)
        if(id){
          me.remove(id)
        }
      })

      Event.$on('toggle_complete',function(id){
        // console.log('params:',params)
        if(id){
          me.toggle_complete(id)
        }
      })

      Event.$on('set_current',function(id){
        // console.log('params:',params)
        if(id){
          me.set_current(id)
        }
      })

      Event.$on('toggle_detail',function(id){
        // console.log('params:',params)
        if(id){
          me.toggle_detail(id)
        }
      })
    },

    methods: {
      check_alerts: function(){
        var me = this //回调函数和this的关系
        this.list.forEach(function(row,i){
          var alert_at = row.alert_at
          if(!alert_at||row.alert_confirmed) return
          // console.log('alert_at',alert_at)

          var alert_at = (new Date(alert_at)).getTime()
          var now = (new Date()).getTime()
          // console.log('xx',alert_at)
          // console.log('now',now)
          if(now >= alert_at){
            // console.log('时间到')
            alert_sound.play()
            var confirmed = confirm(row.title)
            Vue.set(me.list[i],'alert_confirmed',confirmed)
          }
          // var timestamp = alert_at.getTime()
        })
      },

      merge: function() {
        // console.log('this.current:',this.current)
        var is_update, id
        is_update = id = this.current.id

        if(is_update){
          var index = this.find_index(id)
          // var index = this.list.findIndex(function(item){
          //   return item.id == is_update //???
          // })
          //Vue中数组元素的修改不能用下面这种方式
          //this.list[index] = copy(this.current)
          //应该使用如下
          Vue.set(this.list,index,copy(this.current))

          // console.log('this.current:',this.current)
        }else{
          var title = this.current.title
          if(!title && title !== 0) return

          var todo = copy(this.current)
          this.last_id++
          ms.set('last_id',this.last_id)
          todo.id = this.last_id
           // console.log('title',this.current.title)
           this.list.push(todo)
        }

        this.reset_current()
      },

      toggle_detail: function (id){
        var index = this.find_index(id)
        // this.list[index].show_detail
        // console.log(1)
        Vue.set(this.list[index],'show_detail',!this.list[index].show_detail)
        // console.log(this.desc)
      },

      //索引有可能发生变化，它是一个动态的值
      remove: function(id) {
        // cosole.log('removed')
        var index = this.find_index(id)
        this.list.splice(index,1)
        // ms.set('list',this.list)
      },
      // next_id: function(){
      //   //有bug
      //   // return this.list.length + 1
      // },
      set_current: function(todo){
        this.current = copy(todo)
      },
      reset_current: function(){
        this.set_current({})   //????
      },
      find_index(id){  //ES6新特性
        return this.list.findIndex(function(item){
          return item.id == id  //为什么要两层return
        })
      },
      toggle_complete: function(id){
        var i = this.find_index(id)
        Vue.set(this.list[i],'completed',!this.list[i].completed)
        //Vue中数组元素的修改不能用下面这种方式
        // this.list[i].complete = !this.list[i].complete
      }
    },
    watch: {
      list: {
        deep: true,
        handler: function(n,o){
          if(n){
            ms.set('list',n)
          }else{
            ms.set('list',[])
          }
        }
      }
    }
  })
})()
