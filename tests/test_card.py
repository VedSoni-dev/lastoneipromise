"""Tests for card module."""

import pytest
from poker_engine.card import Card, Deck, Rank, Suit, parse_hand


class TestCard:
    """Tests for Card class."""
    
    def test_card_creation(self):
        """Test creating cards."""
        card = Card(Rank.ACE, Suit.SPADES)
        assert card.rank == Rank.ACE
        assert card.suit == Suit.SPADES
        assert str(card) == "A♠"
    
    def test_card_from_string(self):
        """Test parsing cards from strings."""
        card = Card.from_string("As")
        assert card.rank == Rank.ACE
        assert card.suit == Suit.SPADES
        
        card = Card.from_string("10h")
        assert card.rank == Rank.TEN
        assert card.suit == Suit.HEARTS
        
        card = Card.from_string("2c")
        assert card.rank == Rank.TWO
        assert card.suit == Suit.CLUBS
    
    def test_card_comparison(self):
        """Test card ordering."""
        ace_spades = Card(Rank.ACE, Suit.SPADES)
        ace_hearts = Card(Rank.ACE, Suit.HEARTS)
        king_spades = Card(Rank.KING, Suit.SPADES)
        
        assert ace_spades > king_spades  # Higher rank
        assert ace_spades > ace_hearts   # Same rank, higher suit
    
    def test_card_equality(self):
        """Test card equality."""
        card1 = Card(Rank.ACE, Suit.SPADES)
        card2 = Card(Rank.ACE, Suit.SPADES)
        card3 = Card(Rank.ACE, Suit.HEARTS)
        
        assert card1 == card2
        assert card1 != card3
    
    def test_card_hashable(self):
        """Test that cards can be used in sets."""
        card1 = Card(Rank.ACE, Suit.SPADES)
        card2 = Card(Rank.ACE, Suit.SPADES)
        
        card_set = {card1, card2}
        assert len(card_set) == 1
    
    def test_card_serialization(self):
        """Test card to/from dict."""
        card = Card(Rank.KING, Suit.DIAMONDS)
        data = card.to_dict()
        restored = Card.from_dict(data)
        assert card == restored


class TestDeck:
    """Tests for Deck class."""
    
    def test_deck_has_52_cards(self):
        """Test deck initialization."""
        deck = Deck()
        assert deck.remaining == 52
    
    def test_deck_deal(self):
        """Test dealing cards."""
        deck = Deck()
        cards = deck.deal(2)
        assert len(cards) == 2
        assert deck.remaining == 50
    
    def test_deck_deal_one(self):
        """Test dealing single card."""
        deck = Deck()
        card = deck.deal_one()
        assert isinstance(card, Card)
        assert deck.remaining == 51
    
    def test_deck_reset(self):
        """Test deck reset."""
        deck = Deck()
        deck.deal(10)
        assert deck.remaining == 42
        
        deck.reset()
        assert deck.remaining == 52
    
    def test_deck_shuffle_randomness(self):
        """Test that shuffling produces different orderings."""
        deck1 = Deck(seed=1)
        deck2 = Deck(seed=2)
        
        cards1 = deck1.deal(5)
        cards2 = deck2.deal(5)
        
        assert cards1 != cards2
    
    def test_deck_reproducibility(self):
        """Test that same seed gives same deal."""
        deck1 = Deck(seed=42)
        deck2 = Deck(seed=42)
        
        cards1 = deck1.deal(5)
        cards2 = deck2.deal(5)
        
        assert cards1 == cards2
    
    def test_deck_deal_too_many(self):
        """Test dealing more cards than available."""
        deck = Deck()
        deck.deal(50)
        
        with pytest.raises(ValueError):
            deck.deal(5)
    
    def test_deck_burn(self):
        """Test burning a card."""
        deck = Deck()
        deck.burn()
        assert deck.remaining == 51


class TestParseHand:
    """Tests for hand parsing."""
    
    def test_parse_with_spaces(self):
        """Test parsing hand with spaces."""
        cards = parse_hand("As Ks")
        assert len(cards) == 2
        assert cards[0] == Card(Rank.ACE, Suit.SPADES)
        assert cards[1] == Card(Rank.KING, Suit.SPADES)
    
    def test_parse_without_spaces(self):
        """Test parsing hand without spaces."""
        cards = parse_hand("AhKh")
        assert len(cards) == 2
        assert cards[0] == Card(Rank.ACE, Suit.HEARTS)
        assert cards[1] == Card(Rank.KING, Suit.HEARTS)
    
    def test_parse_with_ten(self):
        """Test parsing hands with 10."""
        cards = parse_hand("10s10h")
        assert len(cards) == 2
        assert cards[0].rank == Rank.TEN
        assert cards[1].rank == Rank.TEN
