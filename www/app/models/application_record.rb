class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  def checkAchievment(winner, tag, valid)
		if valid && !winner.achievments.find_by_tag(tag)
			winner.achievments << Achievment.find_by_tag(tag)
			UserChannel.broadcast_to winner, content: {
				achievment: Achievment.find_by_tag(tag).description
			}
		end
	end
end
