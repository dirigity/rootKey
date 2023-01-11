#!/usr/bin/env node
const crypto = require('crypto');
const fs = require("fs");
const isaacCSPRNG = require("./isaac")

const conf = require("./config.js");

function get_metadata(site, user) {
    return JSON.parse(fs.readFileSync(conf.PERSITANCE_FILE))[site][user]
}

function write_metadata(site, user, metadata) {
    let contents = JSON.parse(fs.readFileSync(conf.PERSITANCE_FILE))
    if (!contents[site]) contents[site] = {}
    contents[site][user] = metadata;
    console.log(contents)
    fs.writeFileSync(conf.PERSITANCE_FILE, JSON.stringify(contents))
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
    let { salt, constraints } = get_metadata(site, user).pop()
    let { size, dictionaries, avoid_chars } = constraints;

    dictionaries = dictionaries.map((s) => s.replace(new RegExp("[" + avoid_chars + "]", "g"), '')).filter(d => d != "")

    let hash = crypto.createHash('sha256').update(site + user + salt + master_password).digest('hex')
    let isaac = isaacCSPRNG(hash);

    dictionary_map = build_dictionay_map(size, dictionaries, isaac);

    let password = dictionary_map.map(dic_id => choose_char(dictionaries[dic_id], isaac)).join("");

    return password;
}

function create_profile(site, user, salt_seed) {
    let isaac = isaacCSPRNG(salt_seed);

    write_metadata(site, user, {
        salt: get_salt(isaac),
        constraints: conf.DEFAULT_CONSTRAINTS
    })
}

function entropy_generator() {
    let d = new Date();
    return d.getTime() + ":" + d.getTimezoneOffset() + ":" + JSON.stringify(process.cpuUsage()) +":" +process.uptime() +  ":" + process.pid + ":" + process.ppid + "" + Math.random()
}

// console.log(get_password("epic", "dirigity", "12f034"))
console.log(entropy_generator())
