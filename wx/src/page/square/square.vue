<template>
	<div>
		<div class="info">
			个人信息：
			<p>我收到的：<span class="color" @click="mine(0)">100</span></p>
			<p>我送出的：<span class="color" @click="mine(1)">100</span></p>
		</div>
		<tab v-model="type" prevent-default @on-before-index-change="switchTabItem">
			<tab-item selected>周榜</tab-item>
			<tab-item>月榜</tab-item>
			<tab-item>半年榜</tab-item>
		</tab>
		<div class="list">
			<scroller
				use-pullup
				:pullup-config="pullupDefaultConfig"
				@on-pullup-loading="loadMore"
				lock-x
				ref="scrollerBottom"
				:height="viewH"
			>
				<ul class="list-box">
					<li v-for="i in 100">
						<span @click="detail(i)">{{ " " + i + " " }}</span>
					</li>
				</ul>
			</scroller>
		</div>
		<div class="btn-view">
			<p class="left" @click="selectFun">送爱心</p>
			<p class="right">剩余爱心数：10</p>
		</div>
	</div>
</template>
<script>
import { Tab, TabItem, Scroller } from 'vux'

const pullupDefaultConfig = {
	content: "上拉加载更多",
	pullUpHeight: 60,
	height: 40,
	autoRefresh: false,
	downContent: "释放后加载",
	upContent: "上拉加载更多",
	loadingContent: "加载中...",
	clsPrefix: "xs-plugin-pullup-"
};
export default {
	name: 'square',
	components: {
		Tab,
		TabItem,
		Scroller
	},
	data () {
		return {
			type: 0,
			viewH: "",
			pullupDefaultConfig: pullupDefaultConfig,
			listData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
		}
	},
	mounted () {

		this.viewH = window.innerHeight - 164 + "px";
		this.$nextTick(() => {
			// this.$refs.scrollerBottom.disablePullup();
			// this.$refs.scrollerBottom.reset({ top: 0 });
		});
	},
	methods: {

		switchTabItem (index) {
			console.log('on-before-index-change', index)
			this.$vux.loading.show({
				text: 'loading'
			})
			setTimeout(() => {
				this.$vux.loading.hide()
				this.type = index
			}, 500)
		},
		loadMore () {
			console.log(1)
		},
		selectFun () {
			this.$router.push("/contact");
		},
		mine (type) {
			this.$router.push({
				path: "/my",
				query: {
					type
				}
			})
		},
		detail (id) {
			this.$router.push({
				path: "/details",
				query: {
					id
				}
			})
		}
	}
}
</script>
<style scoped>
.info {
	height: 80px;
}
.btn-view {
	height: 40px;
	position: absolute;
	width: 100%;
	bottom: 0;
	padding: 0;
	line-height: 40px;
}
.left {
	float: left;
}
.right {
	float: right;
}
.color {
	color: blue;
}
</style>
