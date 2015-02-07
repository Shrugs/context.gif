import nltk
from nltk.corpus import stopwords


# Used when tokenizing words
sentence_re = r'''(?x)      # set flag to allow verbose regexps
      ([A-Z])(\.[A-Z])+\.?  # abbreviations, e.g. U.S.A.
    | \w+(-\w+)*            # words with optional internal hyphens
    | \$?\d+(\.\d+)?%?      # currency and percentages, e.g. $12.40, 82%
    | \.\.\.                # ellipsis
    | [][.,;"'?():-_`]      # these are separate tokens
'''


# Taken from Su Nam Kim Paper...
grammar = r"""
    NBAR:
        {<NN.*|JJ>*<NN.*>}  # Nouns and Adjectives, terminated with Nouns

    NP:
        {<NBAR>}
        {<NBAR><IN><NBAR>}  # Above, connected with in/of/etc...
"""
chunker = nltk.RegexpParser(grammar)

stopwords = stopwords.words('english')


def leaves(tree):
    """Finds NP (nounphrase) leaf nodes of a chunk tree."""
    for subtree in tree.subtrees(filter=lambda t: t.label() == 'NP'):
        yield subtree.leaves()


def normalise(word):
    """Normalises words to lowercase and stems and lemmatizes it."""
    word = word.lower()
    return word


def acceptable_word(word):
    """Checks conditions for acceptable word: length, stopword."""
    return bool(2 <= len(word) <= 40 and word.lower() not in stopwords)


def get_terms(tree):
    for leaf in leaves(tree):
        term = [normalise(w) for w, t in leaf if acceptable_word(w)]
        yield term


def get_keywords(text):
    toks = nltk.regexp_tokenize(text, sentence_re)
    postoks = nltk.tag.pos_tag(toks)
    # postoks = [(tok, pos) for tok, pos in postoks if pos != 'NNP']
    tree = chunker.parse(postoks)
    terms = get_terms(tree)
    kws = []
    for t in terms:
        kws.append(' '.join(t))
    if len(kws) > 0:
        return kws[-1]
    else:
        return None
