tell application "Google Chrome"
	set foundTab to false
	set theResult to ""
	repeat with w in windows
		repeat with t in tabs of w
			if URL of t contains "adsense.google.com" then
				set active tab index of w to (index of t)
				set index of w to 1
				
				set theResult to execute t javascript "
					(function() {
						const cb = document.querySelector('input[type=\"checkbox\"]');
						const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
						return JSON.stringify({ cbExists: !!cb, buttons: btns });
					})();
				"
				set foundTab to true
				exit repeat
			end if
		end repeat
		if foundTab then exit repeat
	end repeat
	if not foundTab then set theResult to "Tab not found"
	return theResult
end tell
