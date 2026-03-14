const fs = require('fs');

const serverFile = 'c:/Users/lspss/spy-game/server.js';
const newWordsFile = 'c:/Users/lspss/spy-game/new_words.js';

let serverContent = fs.readFileSync(serverFile, 'utf8');
const newWordsContent = fs.readFileSync(newWordsFile, 'utf8');

// The replacement starts from: const WORD_SETS = {
// and ends at: }; right before const ALL_SETS = [

const startMarker = 'const WORD_SETS = {';
const endMarker = 'const ALL_SETS = [';

const startIndex = serverContent.indexOf(startMarker);
const endIndex = serverContent.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    // Move back to include the last }; before ALL_SETS
    const before = serverContent.slice(0, startIndex);
    const after = serverContent.slice(endIndex);

    const updatedContent = before + newWordsContent + '\n\n' + after;
    fs.writeFileSync(serverFile, updatedContent, 'utf8');
    console.log('Successfully updated server.js');
} else {
    console.error('Could not find markers');
}
