firstNode=true;

function buildNode(json){
    var coords={};
    if (json.attr && json.attr.position) coords={x:json.attr.position[0],y:json.attr.position[1]}
    var id=json.id
    if(firstNode){
        id="root"
        firstNode=false;
    }
    var node=createNode(id,json.title,coords);
    if(json.ideas && _.isEmpty(json.ideas)) return node;
    getIdeas(json.ideas,node);
    return node;
}

function buildGroup(json,parentNode,supports){
    var firstChild=null;
    var ideaIndex=0;
    for(var idea in json){
        var node=buildNode(json[idea]);
        if(ideaIndex===0) {
            firstChild=node;
            node.connectTo(parentNode.inputs[0],supports);
            node.group.createAt(parentNode);
            parentNode.initialArrangement(node.group);
            parentNode.arrangeGroups();
        }
        else{
            argmap.addSiblingHelper(firstChild.group,node);
        }
        ideaIndex++;
    }
}

function getIdeas(json,parentNode=null){
    for(var idea in json){
        if(json[idea].title==="group"){
            buildGroup(json[idea].ideas,parentNode,json[idea].attr.group=="supporting");
        }else{
            buildNode(json[idea]);
        }
    }
}

function buildMap(json){
    getIdeas(json.ideas);
}
