const users = [
    { id: 1, name: "Engelbert Joron", email: "ejoron0@howstuffworks.com", emailVerified: true, image: "https://robohash.org/oditvelnisi.png?size=50x50&set=set1", friends: null, createdAt: "3/22/2025", updatedAt: "5/20/2025" },
    { id: 2, name: "Erv Bantham", email: "ebantham1@etsy.com", emailVerified: false, image: "https://robohash.org/perferendiscumqueconsequatur.png?size=50x50&set=set1", friends: null, createdAt: "1/5/2025", updatedAt: "8/24/2025" },
    { id: 3, name: "Anstice Ohrtmann", email: "aohrtmann2@kickstarter.com", emailVerified: false, image: "https://robohash.org/sapienteettempore.png?size=50x50&set=set1", friends: null, createdAt: "10/26/2024", updatedAt: "5/11/2025" },
    { id: 4, name: "Glynis Gunton", email: "ggunton3@last.fm", emailVerified: false, image: "https://robohash.org/optioetasperiores.png?size=50x50&set=set1", friends: null, createdAt: "11/25/2024", updatedAt: "6/8/2025" },
    { id: 5, name: "Janeczka Perago", email: "jperago4@addthis.com", emailVerified: false, image: "https://robohash.org/sitpraesentiumhic.png?size=50x50&set=set1", friends: null, createdAt: "5/28/2025", updatedAt: "10/30/2024" },
    { id: 6, name: "Saunderson Arton", email: "sarton5@dropbox.com", emailVerified: true, image: "https://robohash.org/quioccaecatiquos.png?size=50x50&set=set1", friends: null, createdAt: "12/9/2024", updatedAt: "2/6/2025" },
    { id: 7, name: "Fallon Colborn", email: "fcolborn6@simplemachines.org", emailVerified: false, image: "https://robohash.org/voluptatemtotamtempora.png?size=50x50&set=set1", friends: null, createdAt: "9/27/2025", updatedAt: "9/28/2025" },
    { id: 8, name: "Rozalie Ladd", email: "rladd7@vistaprint.com", emailVerified: false, image: "https://robohash.org/estfugaconsequatur.png?size=50x50&set=set1", friends: null, createdAt: "2/28/2025", updatedAt: "4/22/2025" },
    { id: 9, name: "Barret Twelftree", email: "btwelftree8@amazonaws.com", emailVerified: false, image: "https://robohash.org/errorquiculpa.png?size=50x50&set=set1", friends: null, createdAt: "11/18/2024", updatedAt: "7/21/2025" },
    { id: 10, name: "Tuck Barlie", email: "tbarlie9@thetimes.co.uk", emailVerified: false, image: "https://robohash.org/aliquidquisipsam.png?size=50x50&set=set1", friends: null, createdAt: "9/26/2025", updatedAt: "6/19/2025" }
]

// retrieving initials from name for fallback
const updatedUsers = users.map((user) => {
    const parts = user.name.trim().split(/\s+/)

    const initials =
        parts.length >= 2
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0][0]

    const fallback = initials.toUpperCase()
    return { ...user, fallback }
})
console.log(updatedUsers[0])