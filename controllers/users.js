import User from "../models/User.js";

// READ
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("friend", "firstName lastName filePath");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const formattedFriend = user.friend
      ? {
          _id: user.friend._id,
          firstName: user.friend.firstName,
          lastName: user.friend.lastName,
        }
      : null;

    res.status(200).json(formattedFriend);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE

export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id).populate("friend");
    const friend = await User.findById(friendId);

    // Check if the user already has a friend
    if (user.friend) {
      // If the user already has a friend, remove the current friend
      const currentFriend = user.friend;
      user.friend = undefined;
      await currentFriend.save();
    }

    // Check if the friend already has a friend
    if (friend.friend) {
      // If the friend already has a friend, remove the current friend
      const currentFriend = friend.friend;
      friend.friend = undefined;
      await currentFriend.save();
    }

    // Pair the users as friends
    user.friend = friendId;
    friend.friend = id;

    await user.save();
    await friend.save();

    const formattedFriend = {
      _id: friend._id,
      firstName: friend.firstName,
      lastName: friend.lastName,
      filePath: friend.filePath,
    };

    res.status(200).json(formattedFriend);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};