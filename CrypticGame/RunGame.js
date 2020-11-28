function shuffle(arr)
{
	let idx,idy,tmp;
	for(idx = 0; idx < arr.length; idx++)
	{
		idy = Math.floor(Math.random()*arr.length);
		tmp = arr[idx];
		arr[idx] = arr[idy];
		arr[idy] = tmp;
	}
	return arr;
}

function blank_message(message)
{
	let retval = "";
	for(letter of message)
	{
		retval += letter == " " ? " " : "_";
	}
	return retval;
}

function cryptify(word,alphabet,cryptic_key)
{
	//First shuffle alphabet, and set new cryptic key
	alphabet = shuffle(alphabet);
	let idx = 0;
	for(key of Object.keys(cryptic_key).sort())
	{
		cryptic_key[key] = alphabet[idx++];
	}

	//Return the cryptified message
	let retval = "";
	for(letter of word)
	{
		retval += cryptic_key[letter]
	}
	return retval;
}

function get_revealing_order(blanked_message)
{
	let retval = []
	let blanked_message_array = blanked_message.split('')
	for(let idx = 0; idx < blanked_message_array.length; idx++)
	{
		if(blanked_message_array[idx] == "_")
		{
			retval.push(idx);
		}
	}
	return shuffle(retval);
}


let isFullCorrect, isCondensedCorrect,isCrypticCorrect;
let res = fetch('https://raw.githubusercontent.com/Mvalentino92/Javascript/main/CrypticGame/test_words.json')
          .then(function(response) { return response.json(); })
	  .then(function(data)
	        {
		  //Get data
		  let definition_words = data[0]; //key,val
		  console.log(definition_words);
		  let messages = data[1]["messages"].map(x => x.toLowerCase()); //list
		  console.log(messages);

		  //Shuffle order
		  words = shuffle(Object.keys(definition_words));	
		  messages = shuffle(messages);
		  console.log(messages);

		  //Letters for shuffling alphabet
		  let alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m",
			      "n","o","p","q","r","s","t","u","v","w","x","y","z"];
		  let cryptic_key = {};
		  for(letter of alphabet)
		  {
			  cryptic_key[letter] = letter;
		  }

		  //Track global progress
	          let word_index = 0;
		  let message_index = 0;
		  let rounds_won = 0;
		  let round_score = 0;
		  let best_score = Infinity;
		  let message = messages[message_index];
		  let blanked_message = blank_message(message);
		  let word = words[word_index];
		  let cryptic_word = cryptify(word,alphabet,cryptic_key);
		  let reveal_index = 0;
		  let revealed_order = get_revealing_order(blanked_message);

		  //Throw up initial values
		  document.getElementById("message_text").innerHTML = blanked_message;
		  document.getElementById("definition_and_word").innerHTML = definition_words[word] + ":    " + cryptic_word;

		 //Handles if message is correct
		 function messageIsCorrect()
		 {
			//Display correct message
			alert("Correct, the message was: "+message);

			//Tally score and if round was won
			round_score -= message.length;
			rounds_won += round_score <= 0;
			best_score = round_score < best_score ? round_score : best_score;
			 
			//Display results
			document.getElementById("round_score").innerHTML = "Last Rounds Score: " + round_score;
			document.getElementById("best_score").innerHTML = "Best Score: " + best_score;
			document.getElementById("rounds_won").innerHTML = "Rounds won: " + rounds_won;

			//Prep for next round
			round_score = 0;
			message_index += 1;
			if(message_index == messages.length) // End game, disable buttons
			{
				document.getElementById("message_text").innerHTML = "You have completed all " +
							"messages, congratulations!";
				Array.from(document.getElementsByClassName("button")).forEach(x => x.disabled = true);
			}
			else // Create and display new blanked message
			{
				message = messages[message_index];
				blanked_message = blank_message(message);
				reveal_index = 0;
				revealed_order = get_revealing_order(blanked_message);
				document.getElementById("message_text").innerHTML = blanked_message;
			}
		  }
		  
		  function update_encrypted_word()
		  {
			// Update encrypted word
			word_index += 1;
			if(word_index == words.length) //If ran out, reshuffle
			{
				word_index = 0;
				words = shuffle(words);
			}
			word = words[word_index];
			cryptic_word = cryptify(word,alphabet,cryptic_key);
			document.getElementById("definition_and_word")
				.innerHTML = definition_words[word] + ":    " + cryptic_word;
		  }

		  //Checks if full message is correct
		  isFullCorrect = function()
		  {
			  //Get comparables
			  let guess = document.getElementById("message_input_full").value;
			  let message = messages[message_index];

			  //Clear text box now
			  document.getElementById("message_input_full").value = "";

			  //Act on verdict of equality
			  if(guess == message)
			  {
			  	  messageIsCorrect(); 
			  }
			  else
			  {
				  alert("Wrong message!");
				  round_score += 1;
			  }
		  }

		  //Check if condensed message is correct
		  isCondensedCorrect = function()
		  {
			  //Make sure number of blanks and supplied letters match
			  let num_of_blanks = blanked_message.split('').map(x => x == "_").reduce((a,b) => a + b,0);
			  let guess =  document.getElementById("message_input_condensed").value;

			  //Clear text box now
			  document.getElementById("message_input_full").value = "";

			  //Check if correct
			  let matches = true;
			  if(num_of_blanks == guess.length)
			  {
				  //Check letters supplied match message at blanks
				  let idx = 0;
				  let blank_count = 0;
				  while(blank_count < num_of_blanks)
				  {
					  //Check if letter is a blank
					  if(blanked_message[idx] == "_")
					  {
						  if(guess[blank_count] != message[idx])
						  {
							  matches = false;
							  break;
						  }
						  blank_count += 1;
					  }
					  idx += 1;
				  }

				  //If matches is true, the message is correct
				  if(matches)
				  {
					  messageIsCorrect();
				  }
				  else
				  {
					  alert("Wrong message!");
					  round_score += 1;
				  }
			  }
			  else //If message was too short or long, alert user
			  {
				  alert("Did not enter correct number of letters");
			  }
		  }

		  //The if cryptic is correct
		  isCrypticCorrect = function()
		  {
			  //Get guess
			  let guess = document.getElementById("cryptic_input").value;

			  //Clear text box
			  document.getElementById("cryptic_input").value = "";

			  //Check if matched to word
			  if(guess == word)
			  {
			        alert("Correct!")
				//Increase score, and add a random letter to blank_message
				round_score += 1;
				let idx = revealed_order[reveal_index];
				let blanked_message_array = blanked_message.split('');
				blanked_message_array[idx] = message[idx];
				blanked_message = blanked_message_array.join('');
				blanked_message[idx] = message[idx];
				reveal_index += 1;

				//Reveal more of the message
				console.log("Index: "+idx);
				console.log("Message: "+message);
				console.log("Blanked Message: "+blanked_message);
				document.getElementById("message_text").innerHTML = blanked_message;

				//Check if whole message revealed, if true then call message is correct
				if(reveal_index == revealed_order.length)
				{
					messageIsCorrect();
				}

				update_encrypted_word()

			  }
			  else //Didn't guess correctly
			  {
				  alert("Not correct!")
				  round_score += 1;
				  update_encrypted_word();
			  }

		   }
		}
				

	  );
