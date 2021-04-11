// 設定遊戲狀態
const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
  }


const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
    './heart.svg', // 愛心
    './diamond.svg', // 方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
  ]
const view = {
    getCardElement (index) {
        return `<div data-index="${index}" class="card back"></div>`
    },
    getCardContent(index){
        const number = this.transformNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        if(symbol == Symbols[1] || symbol == Symbols[2] ){
            return `
            <p style="color:red">${number}</p>
            <img src="${symbol}" />
            <p style="color:red">${number}</p>
        `
        }else{
            return `
            <p>${number}</p>
            <img src="${symbol}" />
            <p>${number}</p>
        `
        }
        
    },
    transformNumber (number) {
        switch (number) {
        case 1:
            return 'A'
        case 11:
            return 'J'
        case 12:
            return 'Q'
        case 13:
            return 'K'
        default:
            return number
        }
    },
    displayCards (indexes) {
        const rootElement = document.querySelector('#cards')
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    },
    flipCards (...cards) {
        cards.map( card =>{
            if (card.classList.contains('back')) {
                // 回傳正面
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
              }
              // 回傳背面
              card.classList.add('back')
              card.innerHTML = null
        })
    },
    pairCards(...cards){
        cards.map(card =>{
            card.classList.add('paired')
        })
        
    },
    renderScore(score){
        document.querySelector('.score').textContent = `Score : ${score}`
    },
    renderTriedTimes(times){
        document.querySelector('.tried').textContent = `You've tried: ${times} times`
    },
    renderTryError(...cards){
        cards.map(card=>{
            card.classList.add('wrong')
            card.addEventListener('animationend',()=>{
                card.classList.remove('wrong')
            },{ once: true  })
        })
    },
    renderShowWin(){
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML =`
        <p>Complete</p>
        <p>Score: ${model.score}</p>
        <p>TriedTimes: You've tried: ${model.triedTimes} times</p> 
        `
        const header = document.querySelector('#header')
        header.before(div)
    }
}

const utility = {
      getRandomNumberArray (count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
          let randomIndex = Math.floor(Math.random() * (index + 1))
            ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
      }
}

const model = {
    revealedCards: [],
    isRevealedCardsMatched(){
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
    },
    score:0,
    triedTimes:0
}



const controller = {
    currentState: GAME_STATE.FirstCardAwaits, 
    generateCards(){
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardAction(card){
        if(!card.classList.contains('back')) return
        
        switch (this.currentState){
            case GAME_STATE.FirstCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                if (model.isRevealedCardsMatched()){
                    view.renderScore(model.score += 10)
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    this.currentState = GAME_STATE.FirstCardAwaits
                    if (model.score === 260){
                        this.currentState = GAME_STATE.GameFinished
                        view.renderShowWin()
                        return
                    }
                }else{
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.renderTryError(...model.revealedCards)
                    setTimeout(this.resetCards, 1000)
                }
                break
        }
        console.log("點擊的卡牌",model.revealedCards.map(card => card.dataset.index))
        console.log("目前狀態",this.currentState)
         
    },
    resetCards(){
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}


controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
    })
})