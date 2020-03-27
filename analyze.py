import numpy as np
import pandas as pd

vote_diffs = pd.read_csv("data/vote_diffs_mean.csv")

# print(vote_diffs["yesVotesDiff"].mean())

print(vote_diffs.sort_values(by="yesVotesDiff", ascending=False))