<template>
    <div class="img-bg">
        <div class="er-img"></div>
    </div>
</template>

<script>
export default {};
</script>

<style scoped>
.img-bg{
    width: 7.5rem;
    height:14rem;
    background: url("./../../assets/img/imgBgShare.png") no-repeat;
    background-size: 100%;
    position: relative;
}
.er-img{
    position: absolute;
    width: .7rem;
    height: .7rem;
    background-color: #000;
    bottom: .2rem;
    right: .2rem;
}
</style>