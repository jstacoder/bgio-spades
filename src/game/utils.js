import { cardValues, SUITS, SPADES } from './constants';

const zeroCondition = (bid, bookCount) => bookCount === 0

const nonZeroCondition = (bid, bookCount) => bookCount >= bid

const scoreConditions = [
    zeroCondition,
    nonZeroCondition,
]

export const calculateScore = ({ bid, bookCount }) => {
    let baseScore = bid !== 0 ? (bid * 10) : 100;
    let score = 0;
    let bags = 0;

    let scoreCondition = scoreConditions[bid === 0 ? 0 : 1];

    const passedCondition = scoreCondition(bid, bookCount);

    if (passedCondition) {
        score += baseScore;
        bags += bookCount - bid;
        score += bags;
    } else {
        score -= baseScore;
    }
    return { score, bags };
}

export const getCardValue = value => cardValues.findIndex(e => e === value)

export const findWinningPlayer = book => {
    let winningPlayer = null;
    let hiCard = null;
    let hiSuit = null;
    book.forEach(({ player, card }) => {
        const cardValue = getCardValue(card.value);

        if (hiCard == null) {
            hiSuit = card.suit;
            hiCard = cardValue;
            winningPlayer = player;
        } else {
            if (card.suit !== hiSuit) {
                if (card.suit === SPADES) {
                    hiCard = cardValue;
                    hiSuit = card.suit;
                    winningPlayer = player;
                }
            } else {
                if (cardValue > hiCard) {
                    hiCard = cardValue;
                    hiSuit = card.suit;
                    winningPlayer = player;
                }
            }
        }
    })
    return winningPlayer
}

export const compareSuitAndVal = (a, b) => {
    // if suits dont match
    if(a.suit !== b.suit){
        // sort by suit index
        const aSuitIndex = SUITS.findIndex(e=> e === a.suit)
        const bSuitIndex = SUITS.findIndex(e=> b.suit === e)

        if(aSuitIndex < bSuitIndex){
            return -1
        }else{
            return 1
        }
    }else{
        const aIndex = cardValues.findIndex(e=> e===a.value)
        const bIndex = cardValues.findIndex(e=> e===b.value)
        if(aIndex < bIndex){
            return -1
        }else{
            return 1
        }
    }
}
