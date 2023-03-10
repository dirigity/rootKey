#!/usr/bin/env node
const crypto = require('crypto');
const fs = require("fs");
const isaacCSPRNG = require("./isaac")

const conf = require("./config.js");

function get_metadata(site, user) {
    let file_text = fs.readFileSync(conf.PERSITANCE_FILE);
    if (file_text == "") file_text = "{}"
    return JSON.parse(file_text)[site][user].pop()
}

function write_metadata(site, user, metadata) {
    let file_text = fs.readFileSync(conf.PERSITANCE_FILE);
    if (file_text == "") file_text = "{}"
    let contents = JSON.parse(file_text)
    
    if (!contents[site]) contents[site] = {}
    if (!contents[site][user]) contents[site][user] = []
    contents[site][user].push(metadata);
    fs.writeFileSync(conf.PERSITANCE_FILE, JSON.stringify(contents, " ", 4))
}

function shuffle(array, isaac) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = isaac.range(currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function choose_char(dict, isaac) {
    return dict[isaac.range(dict.length - 1)];
}

function get_salt(isaac) {
    return isaac.chars(1024)
}

function entropy_generator() {
    let d = new Date();
    return d.getTime() + ":" + d.getTimezoneOffset() + ":" + JSON.stringify(process.cpuUsage()) + ":" + process.uptime() + ":" + process.pid + ":" + process.ppid + "" + Math.random()
}

function build_dictionay_map(size, dictionaries, isaac) {
    let dictionary_map = []

    let total_indirection = [];
    dictionaries.forEach((v, i) => {
        dictionary_map.push(i)
        total_indirection.push(... new Array(v.length).fill(i))
    });

    let samples = size - dictionary_map.length;
    let jump = total_indirection.length / samples;

    for (let i = 0; i < samples; i++) {
        dictionary_map.push(total_indirection[Math.floor(jump * i)]);
    }

    return shuffle(dictionary_map, isaac);
}

function get_password(site, user, master_password) {
    console.log("master pasword fingerprint:", crypto.createHash('sha256').update(master_password).digest("hex").substring(0, 4));
    let { salt, constraints } = get_metadata(site, user)
    let { size, dictionaries, avoid_chars } = constraints;

    // console.log(dictionaries, avoid_chars)
    dictionaries = dictionaries.map((s) => {
        reduced = s
        for (const avoid_c of avoid_chars) {
            reduced = reduced.replaceAll(avoid_c, '');

        }
        // console.log(reduced)
        return reduced
    }).filter(d => d != "")
    // console.log(dictionaries)

    let hash = crypto.createHash('sha256').update(site + user + salt + master_password).digest('hex')
    let isaac = isaacCSPRNG(hash);

    dictionary_map = build_dictionay_map(size, dictionaries, isaac);


    let password = dictionary_map.map(dic_id => choose_char(dictionaries[dic_id], isaac)).join("");

    return password;
}

function create_profile(site, user) {
    let isaac = isaacCSPRNG(entropy_generator());

    write_metadata(site, user, {
        salt: get_salt(isaac),
        constraints: conf.DEFAULT_CONSTRAINTS
    })
}


function mod_profile(site, user, f) {
    write_metadata(site, user, f(get_metadata(site, user)))
}

module.exports = { create_profile, get_password, mod_profile }
