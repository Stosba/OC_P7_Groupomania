<template>
    <div class="posts">
        <article class="post" v-for = "post in posts" :key="post.id">
            <router-link :to="{ name: 'Post', params: { id: post.id } }">
                <div class="post-header">
                    <span class="post-info">Posté le {{dateFormat(post.createdAt)}} par {{post.username}}</span>
                    <span class="post-modify" v-if="post.userId == $user.userId">Modifier</span> 
                </div>  
                <h2 class="post-title">{{post.title}}</h2>
                <div class="post-content" v-html="characterLimit(post.content)"></div>
            </router-link>
            
            <!-- Likes -->
            <vue-star animate="animated rubberBand" color="#F05654">
                <a slot="icon" class="fa fa-heart" @click="postLike"></a>
            </vue-star>
            
            <!-- Comment -->
            <form @submit.prevent= newComment()>
                <!-- <label for="new-comment">Laisser un commentaire :</label> -->
                <textarea name="newComment" id="new-comment" placeholder="Laisser un commentaire..." required></textarea>
                <button type="submit" id="send-comment">Envoyer</button>
            </form>
             <h2 v-if="comments.length > 0">Commentaires :</h2>
            <div class="comments">
                <div class="comment" v-for="comment in comments" :key="comment.id">
                <div class="comment-info">Par {{comment.username}} le {{dateFormat(comment.createdAt)}} 
                  <span @click="deleteComment(comment.id)" v-if="comment.userId == $user.userId || $user.admin == 1" :key="comment.id">Supprimer</span>
                </div>
                    {{comment.content}}
                </div>
            </div>
        </article>
    </div>
</template>

<script>
import axios from 'axios';
import VueStar from 'vue-star';

export default {
    VueStar,
    name: 'Posts',
    names: 'Comments',

    data(){
        return {
            posts: [],
            comments: [],
            visible: false,
            username: ''
        }
    },

    mounted() {
        if(localStorage.user != undefined){
            this.getAllPost();
        }

        //Export de la fonction
        this.$root.$on('Posts', () => {
            this.getAllPost();
        });

        if (localStorage.user) {
      this.user = localStorage.user;
    }
    this.getAllComments();

    },

    watch: {
    username(newName) {
      localStorage.username = newName;
    }
  },

    methods: {
        getAllPost(){
            axios.get(`${this.$apiUrl}/posts/`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.$token}`
                    }
                }
            )
            .then(res => {
                this.posts = res.data;
                console.log(this.posts);
            })
        },

        characterLimit(content){
            let text = content;
            const maxLength = 350;

            if(text.length > maxLength){
                return text.substring(0, maxLength - 3) + "...";
            }
            else{
                return text;
            }
        },

        dateFormat(date){
            const event = new Date(date);

            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

            return event.toLocaleDateString('fr-FR', options);
        },

        postLike() {
            const postId = parseInt(this.$route.params.id);

            axios.post(`${this.$apiUrl}/posts/${postId}/vote/like`,
            {
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.$token}`
                    }
                }
            )
        },
        

        newComment(){
            const postId = parseInt(this.$route.params.id);
            const userId = this.$user.userId;
            const content = document.getElementById('new-comment').value;

            axios.post(`${this.$apiUrl}/posts/${postId}/comment/`,
                {
                    userId,
                    content
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.$token}`
                    }
                }
            )
            .then(this.getAllComments());
        },

        getAllComments(){
            const postId = parseInt(this.$route.params.id);

            axios.get(`${this.$apiUrl}/posts/${postId}/comments`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.$token}`
                    }
                }
            )
            .then(res => {
                this.comments = res.data;
            });
        },

        deleteComment(commentId){
            axios.delete(`${this.$apiUrl}/posts/comment/${commentId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.$token}`
                    }
                }
            )
            .then(this.getAllComments());
        },
    },
}
</script>

<style scoped>
    .posts{
        margin: 0 auto;
        padding: 20px;
        max-width: 800px;
    }

    .post{
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 20px 20px 20px 30px;
        margin-bottom: 30px;
        border-left: 5px solid red;
        box-shadow: 0px 0px 50px -7px rgba(0,0,0,0.1);
        text-align: left;
        transition-duration: .1s;
    }

    .post:hover{
        box-shadow: 0px 0px 50px -7px rgba(0, 0, 0, 0.2);
    }

    .post h2{
        margin-top: 7px;
    }

    .post-header{
        display: flex;
        justify-content: space-between;
        color: rgb(0, 0, 0);
        font-size: .8rem;
    }

    .post-modify{
        color: rgb(219, 17, 17);
        font-size: 1rem;
        font-weight: bold;
    }

    .post-title{
        color: red;
    }

    .post-content{
        font-size: .9rem;
    }

    .likes{
        display: flex;
    }

    .like{
        position: relative;
    }

    .dislike{
        position: relative;
    }

    i {
        size: 1em;
        margin: 1em;
    }

</style>