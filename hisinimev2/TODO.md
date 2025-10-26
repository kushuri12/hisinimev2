# TODO: Modify History to One Entry Per Anime

- [x] Modify saveHistory function in storage.js for localStorage: Change filtering to remove existing entries for the same animeId and source (not episodeId), then add the new historyItem.
- [x] Modify saveHistoryToFirestore function: Change query to check by animeId and source only. Update existing or add new.
- [x] Modify removeHistoryFromFirestore function: Change query to remove by animeId and source only.
